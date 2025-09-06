import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Queue } from 'bullmq';
import { prisma, redis } from '../index';
import { encryptSettings, decryptSettings } from '../utils/encryption';

const syncQueue = new Queue('syncQueue', { connection: redis });

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Middleware to check admin role
  const requireAdmin = async (request: any, reply: any) => {
    const user = request.user;
    if (!user || user.role !== 'ADMIN') {
      return reply.status(403).send({
        success: false,
        error: 'Admin access required'
      });
    }
  };

  // Dashboard stats
  fastify.get('/dashboard', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const [
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
        recentOrders
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: 'DELIVERED' },
          _sum: { total: true }
        }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { email: true, name: true }
            },
            items: {
              include: {
                product: {
                  select: { title: true }
                }
              }
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          stats: {
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
            totalProducts,
            totalUsers
          },
          recentOrders
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch dashboard data'
      });
    }
  });

  // Orders management
  fastify.get('/orders', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { page = 1, limit = 20, status, provider } = request.query as any;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: {
              select: { email: true, name: true }
            },
            items: {
              include: {
                product: {
                  select: { title: true }
                }
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({ where })
      ]);

      return {
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  });

  // Product management
  fastify.get('/products', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { page = 1, limit = 20 } = request.query as any;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          include: {
            providerMappings: true,
            _count: {
              select: {
                orderItems: true,
                likes: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count()
      ]);

      return {
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  });

  // Create/Update product
  fastify.post('/products', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const productData = z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        images: z.array(z.string()),
        tags: z.array(z.string()),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        providerMappings: z.array(z.object({
          provider: z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']),
          providerProductId: z.string(),
          providerVariantId: z.string().optional(),
          price: z.number(),
          cost: z.number()
        }))
      }).parse(request.body);

      let product;

      if (productData.id) {
        // Update existing product
        product = await prisma.product.update({
          where: { id: productData.id },
          data: {
            title: productData.title,
            description: productData.description,
            category: productData.category,
            images: productData.images,
            tags: productData.tags,
            seoTitle: productData.seoTitle,
            seoDescription: productData.seoDescription,
            providerMappings: {
              deleteMany: {},
              create: productData.providerMappings
            }
          },
          include: {
            providerMappings: true
          }
        });
      } else {
        // Create new product
        product = await prisma.product.create({
          data: {
            title: productData.title,
            description: productData.description,
            category: productData.category,
            images: productData.images,
            tags: productData.tags,
            seoTitle: productData.seoTitle,
            seoDescription: productData.seoDescription,
            providerMappings: {
              create: productData.providerMappings
            }
          },
          include: {
            providerMappings: true
          }
        });
      }

      return {
        success: true,
        data: { product }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to save product'
      });
    }
  });

  // Offers management
  fastify.get('/offers', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const offers = await prisma.offer.findMany({
        include: {
          products: {
            include: {
              product: {
                select: { id: true, title: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        data: { offers }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch offers'
      });
    }
  });

  // Create/Update offer
  fastify.post('/offers', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const offerData = z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string(),
        type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
        scope: z.enum(['SITEWIDE', 'PRODUCT', 'CATEGORY']),
        value: z.number(),
        minOrderValue: z.number().optional(),
        maxDiscount: z.number().optional(),
        validFrom: z.string().datetime(),
        validTo: z.string().datetime(),
        isActive: z.boolean(),
        usageLimit: z.number().optional(),
        productIds: z.array(z.string()).optional()
      }).parse(request.body);

      let offer;

      if (offerData.id) {
        // Update existing offer
        offer = await prisma.offer.update({
          where: { id: offerData.id },
          data: {
            title: offerData.title,
            description: offerData.description,
            type: offerData.type,
            scope: offerData.scope,
            value: offerData.value,
            minOrderValue: offerData.minOrderValue,
            maxDiscount: offerData.maxDiscount,
            validFrom: new Date(offerData.validFrom),
            validTo: new Date(offerData.validTo),
            isActive: offerData.isActive,
            usageLimit: offerData.usageLimit,
            products: offerData.productIds ? {
              deleteMany: {},
              create: offerData.productIds.map(productId => ({
                productId
              }))
            } : undefined
          }
        });
      } else {
        // Create new offer
        offer = await prisma.offer.create({
          data: {
            title: offerData.title,
            description: offerData.description,
            type: offerData.type,
            scope: offerData.scope,
            value: offerData.value,
            minOrderValue: offerData.minOrderValue,
            maxDiscount: offerData.maxDiscount,
            validFrom: new Date(offerData.validFrom),
            validTo: new Date(offerData.validTo),
            isActive: offerData.isActive,
            usageLimit: offerData.usageLimit,
            products: offerData.productIds ? {
              create: offerData.productIds.map(productId => ({
                productId
              }))
            } : undefined
          }
        });
      }

      return {
        success: true,
        data: { offer }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to save offer'
      });
    }
  });

  // Provider settings
  fastify.get('/providers', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const providers = await prisma.settings.findMany({
        where: {
          key: {
            in: ['PRINTROVE_API_KEY', 'PRINTFUL_API_KEY', 'PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID']
          }
        }
      });

      const decryptedProviders = providers.map(setting => ({
        key: setting.key,
        value: setting.encrypted ? decryptSettings(setting.value) : setting.value,
        hasValue: !!setting.value
      }));

      return {
        success: true,
        data: { providers: decryptedProviders }
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch provider settings'
      });
    }
  });

  // Update provider settings
  fastify.post('/providers', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const providerData = z.object({
        PRINTROVE_API_KEY: z.string().optional(),
        PRINTFUL_API_KEY: z.string().optional(),
        PRINTIFY_API_KEY: z.string().optional(),
        PRINTIFY_SHOP_ID: z.string().optional()
      }).parse(request.body);

      for (const [key, value] of Object.entries(providerData)) {
        if (value) {
          await prisma.settings.upsert({
            where: { key },
            update: {
              value: encryptSettings(value),
              encrypted: true
            },
            create: {
              key,
              value: encryptSettings(value),
              encrypted: true
            }
          });
        }
      }

      return {
        success: true,
        message: 'Provider settings updated'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update provider settings'
      });
    }
  });

  // Sync catalog from providers
  fastify.post('/sync-catalog', { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { provider } = z.object({
        provider: z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']).optional()
      }).parse(request.body);

      if (provider) {
        await syncQueue.add('syncProvider', { provider });
      } else {
        // Sync all providers
        await syncQueue.add('syncProvider', { provider: 'PRINTROVE' });
        await syncQueue.add('syncProvider', { provider: 'PRINTFUL' });
        await syncQueue.add('syncProvider', { provider: 'PRINTIFY' });
      }

      return {
        success: true,
        message: 'Catalog sync initiated'
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to initiate catalog sync'
      });
    }
  });
};

export default adminRoutes;