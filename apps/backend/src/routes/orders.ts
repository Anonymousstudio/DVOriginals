import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Queue } from 'bullmq';
import { prisma, redis } from '../index';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/payment';

const orderQueue = new Queue('orderQueue', { connection: redis });

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    selectedProvider: z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']).optional()
  })),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    country: z.string().default('India'),
    pincode: z.string()
  }),
  email: z.string().email(),
  phone: z.string().optional()
});

const VerifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string()
});

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  // Create order and initiate payment
  fastify.post('/', async (request, reply) => {
    try {
      const orderData = CreateOrderSchema.parse(request.body);
      const userId = (request as any).user?.userId;

      // Fetch products and calculate totals
      const productIds = orderData.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        },
        include: {
          providerMappings: {
            where: { isActive: true }
          }
        }
      });

      if (products.length !== productIds.length) {
        return reply.status(400).send({
          success: false,
          error: 'Some products are not available'
        });
      }

      let subtotal = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // Select provider mapping (prefer selected or cheapest)
        let selectedMapping = product.providerMappings[0];
        if (item.selectedProvider) {
          const providerMapping = product.providerMappings.find(
            m => m.provider === item.selectedProvider
          );
          if (providerMapping) {
            selectedMapping = providerMapping;
          }
        } else {
          // Select cheapest option
          selectedMapping = product.providerMappings.reduce((min, current) =>
            current.price < min.price ? current : min
          );
        }

        const itemTotal = selectedMapping.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: selectedMapping.price,
          provider: selectedMapping.provider,
          providerProductId: selectedMapping.providerProductId,
          providerVariantId: selectedMapping.providerVariantId
        });
      }

      // Calculate shipping and tax
      const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + shipping + tax;

      // Create order in database
      const order = await prisma.order.create({
        data: {
          userId,
          email: orderData.email,
          phone: orderData.phone,
          subtotal,
          shipping,
          tax,
          total,
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder({
        amount: Math.round(total * 100), // Convert to paisa
        currency: 'INR',
        receipt: order.id,
        notes: {
          orderId: order.id,
          email: orderData.email
        }
      });

      return {
        success: true,
        data: {
          order: {
            id: order.id,
            total: order.total,
            items: order.items
          },
          razorpayOrder: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
          }
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create order'
      });
    }
  });

  // Verify payment and process order
  fastify.post('/verify-payment', async (request, reply) => {
    try {
      const { orderId, paymentId, signature } = VerifyPaymentSchema.parse(request.body);

      // Verify payment with Razorpay
      const isValid = await verifyRazorpayPayment(paymentId, orderId, signature);

      if (!isValid) {
        return reply.status(400).send({
          success: false,
          error: 'Payment verification failed'
        });
      }

      // Update order status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Add to processing queue
      await orderQueue.add('processOrder', {
        orderId: order.id
      });

      return {
        success: true,
        data: { order }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Payment verification failed'
      });
    }
  });

  // Get user orders (authenticated)
  fastify.get('/my-orders', {
    preHandler: async (request, reply) => {
      // Add auth middleware
      // TODO: Implement JWT authentication
    }
  }, async (request, reply) => {
    try {
      const userId = (request as any).user?.userId;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication required'
        });
      }

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: { orders }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  });

  // Get order by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user?.userId;

      const order = await prisma.order.findFirst({
        where: {
          id,
          ...(userId ? { userId } : {})
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: 'Order not found'
        });
      }

      return {
        success: true,
        data: { order }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch order'
      });
    }
  });
};

export default orderRoutes;