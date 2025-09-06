import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../index';

const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  selectedProvider: z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']).optional()
});

const UpdateCartSchema = z.object({
  items: z.array(CartItemSchema)
});

const cartRoutes: FastifyPluginAsync = async (fastify) => {
  // Get user cart (authenticated)
  fastify.get('/', {
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

      let cart = await prisma.cart.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId,
            items: []
          }
        });
      }

      // Get product details for cart items
      const cartItems = cart.items as any[];
      const productIds = cartItems.map(item => item.productId);

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

      const cartWithProducts = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;

        // Select provider mapping
        let selectedMapping = product.providerMappings[0];
        if (item.selectedProvider) {
          const providerMapping = product.providerMappings.find(
            m => m.provider === item.selectedProvider
          );
          if (providerMapping) {
            selectedMapping = providerMapping;
          }
        }

        return {
          ...item,
          product,
          selectedMapping,
          subtotal: selectedMapping.price * item.quantity
        };
      }).filter(Boolean);

      const total = cartWithProducts.reduce((sum, item) => sum + (item?.subtotal || 0), 0);

      return {
        success: true,
        data: {
          cart: {
            id: cart.id,
            items: cartWithProducts,
            total
          }
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch cart'
      });
    }
  });

  // Update cart (authenticated)
  fastify.put('/', {
    preHandler: async (request, reply) => {
      // Add auth middleware
      // TODO: Implement JWT authentication
    }
  }, async (request, reply) => {
    try {
      const userId = (request as any).user?.userId;
      const { items } = UpdateCartSchema.parse(request.body);

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: 'Authentication required'
        });
      }

      // Validate products exist
      const productIds = items.map(item => item.productId);
      const validProducts = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        },
        select: { id: true }
      });

      const validProductIds = validProducts.map(p => p.id);
      const validItems = items.filter(item => validProductIds.includes(item.productId));

      // Update or create cart
      const cart = await prisma.cart.upsert({
        where: {
          id: 'dummy-id' // This will always fail for create path
        },
        update: {
          items: validItems
        },
        create: {
          userId,
          items: validItems
        }
      });

      return {
        success: true,
        data: { cart }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update cart'
      });
    }
  });

  // Clear cart (authenticated)
  fastify.delete('/', {
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

      await prisma.cart.updateMany({
        where: { userId },
        data: { items: [] }
      });

      return {
        success: true,
        message: 'Cart cleared'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to clear cart'
      });
    }
  });
};

export default cartRoutes;