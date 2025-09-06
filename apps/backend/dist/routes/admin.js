"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const bullmq_1 = require("bullmq");
const index_1 = require("../index");
const encryption_1 = require("../utils/encryption");
const syncQueue = new bullmq_1.Queue('syncQueue', { connection: index_1.redis });
const adminRoutes = async (fastify) => {
    // Middleware to check admin role
    const requireAdmin = async (request, reply) => {
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
            const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders] = await Promise.all([
                index_1.prisma.order.count(),
                index_1.prisma.order.aggregate({
                    where: { status: 'DELIVERED' },
                    _sum: { total: true }
                }),
                index_1.prisma.product.count({ where: { isActive: true } }),
                index_1.prisma.user.count({ where: { role: 'USER' } }),
                index_1.prisma.order.findMany({
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
        }
        catch (error) {
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
            const { page = 1, limit = 20, status, provider } = request.query;
            const skip = (page - 1) * limit;
            const where = {};
            if (status)
                where.status = status;
            const [orders, total] = await Promise.all([
                index_1.prisma.order.findMany({
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
                index_1.prisma.order.count({ where })
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
        }
        catch (error) {
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
            const { page = 1, limit = 20 } = request.query;
            const skip = (page - 1) * limit;
            const [products, total] = await Promise.all([
                index_1.prisma.product.findMany({
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
                index_1.prisma.product.count()
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
        }
        catch (error) {
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
            const productData = zod_1.z.object({
                id: zod_1.z.string().optional(),
                title: zod_1.z.string(),
                description: zod_1.z.string(),
                category: zod_1.z.string(),
                images: zod_1.z.array(zod_1.z.string()),
                tags: zod_1.z.array(zod_1.z.string()),
                seoTitle: zod_1.z.string().optional(),
                seoDescription: zod_1.z.string().optional(),
                providerMappings: zod_1.z.array(zod_1.z.object({
                    provider: zod_1.z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']),
                    providerProductId: zod_1.z.string(),
                    providerVariantId: zod_1.z.string().optional(),
                    price: zod_1.z.number(),
                    cost: zod_1.z.number()
                }))
            }).parse(request.body);
            let product;
            if (productData.id) {
                // Update existing product
                product = await index_1.prisma.product.update({
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
            }
            else {
                // Create new product
                product = await index_1.prisma.product.create({
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
        }
        catch (error) {
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
            const offers = await index_1.prisma.offer.findMany({
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
        }
        catch (error) {
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
            const offerData = zod_1.z.object({
                id: zod_1.z.string().optional(),
                title: zod_1.z.string(),
                description: zod_1.z.string(),
                type: zod_1.z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
                scope: zod_1.z.enum(['SITEWIDE', 'PRODUCT', 'CATEGORY']),
                value: zod_1.z.number(),
                minOrderValue: zod_1.z.number().optional(),
                maxDiscount: zod_1.z.number().optional(),
                validFrom: zod_1.z.string().datetime(),
                validTo: zod_1.z.string().datetime(),
                isActive: zod_1.z.boolean(),
                usageLimit: zod_1.z.number().optional(),
                productIds: zod_1.z.array(zod_1.z.string()).optional()
            }).parse(request.body);
            let offer;
            if (offerData.id) {
                // Update existing offer
                offer = await index_1.prisma.offer.update({
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
            }
            else {
                // Create new offer
                offer = await index_1.prisma.offer.create({
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
        }
        catch (error) {
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
            const providers = await index_1.prisma.settings.findMany({
                where: {
                    key: {
                        in: ['PRINTROVE_API_KEY', 'PRINTFUL_API_KEY', 'PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID']
                    }
                }
            });
            const decryptedProviders = providers.map(setting => ({
                key: setting.key,
                value: setting.encrypted ? (0, encryption_1.decryptSettings)(setting.value) : setting.value,
                hasValue: !!setting.value
            }));
            return {
                success: true,
                data: { providers: decryptedProviders }
            };
        }
        catch (error) {
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
            const providerData = zod_1.z.object({
                PRINTROVE_API_KEY: zod_1.z.string().optional(),
                PRINTFUL_API_KEY: zod_1.z.string().optional(),
                PRINTIFY_API_KEY: zod_1.z.string().optional(),
                PRINTIFY_SHOP_ID: zod_1.z.string().optional()
            }).parse(request.body);
            for (const [key, value] of Object.entries(providerData)) {
                if (value) {
                    await index_1.prisma.settings.upsert({
                        where: { key },
                        update: {
                            value: (0, encryption_1.encryptSettings)(value),
                            encrypted: true
                        },
                        create: {
                            key,
                            value: (0, encryption_1.encryptSettings)(value),
                            encrypted: true
                        }
                    });
                }
            }
            return {
                success: true,
                message: 'Provider settings updated'
            };
        }
        catch (error) {
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
            const { provider } = zod_1.z.object({
                provider: zod_1.z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']).optional()
            }).parse(request.body);
            if (provider) {
                await syncQueue.add('syncProvider', { provider });
            }
            else {
                // Sync all providers
                await syncQueue.add('syncProvider', { provider: 'PRINTROVE' });
                await syncQueue.add('syncProvider', { provider: 'PRINTFUL' });
                await syncQueue.add('syncProvider', { provider: 'PRINTIFY' });
            }
            return {
                success: true,
                message: 'Catalog sync initiated'
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to initiate catalog sync'
            });
        }
    });
};
exports.default = adminRoutes;
