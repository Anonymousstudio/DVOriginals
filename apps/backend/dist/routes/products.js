"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const index_1 = require("../index");
const ProductQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().default(1),
    limit: zod_1.z.coerce.number().default(20),
    category: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional() // comma-separated
});
const productRoutes = async (fastify) => {
    // Get all products (public)
    fastify.get('/', async (request, reply) => {
        try {
            const { page, limit, category, search, tags } = ProductQuerySchema.parse(request.query);
            const skip = (page - 1) * limit;
            const where = {
                isActive: true
            };
            if (category) {
                where.category = category;
            }
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (tags) {
                const tagArray = tags.split(',').map(tag => tag.trim());
                where.tags = {
                    hasSome: tagArray
                };
            }
            const [products, total] = await Promise.all([
                index_1.prisma.product.findMany({
                    where,
                    include: {
                        providerMappings: {
                            where: { isActive: true }
                        },
                        likes: true,
                        _count: {
                            select: {
                                likes: true
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                index_1.prisma.product.count({ where })
            ]);
            // Calculate minimum price and add like counts
            const productsWithMinPrice = products.map(product => {
                const minPrice = Math.min(...product.providerMappings.map(m => m.price));
                return {
                    ...product,
                    minPrice,
                    likesCount: product._count.likes,
                    _count: undefined
                };
            });
            return {
                success: true,
                data: {
                    products: productsWithMinPrice,
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
    // Get single product (public)
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const product = await index_1.prisma.product.findUnique({
                where: { id, isActive: true },
                include: {
                    providerMappings: {
                        where: { isActive: true }
                    },
                    likes: true,
                    _count: {
                        select: {
                            likes: true
                        }
                    }
                }
            });
            if (!product) {
                return reply.status(404).send({
                    success: false,
                    error: 'Product not found'
                });
            }
            // Calculate minimum price
            const minPrice = Math.min(...product.providerMappings.map(m => m.price));
            return {
                success: true,
                data: {
                    product: {
                        ...product,
                        minPrice,
                        likesCount: product._count.likes,
                        _count: undefined
                    }
                }
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch product'
            });
        }
    });
    // Get related products
    fastify.get('/:id/related', async (request, reply) => {
        try {
            const { id } = request.params;
            const currentProduct = await index_1.prisma.product.findUnique({
                where: { id },
                select: { category: true, tags: true }
            });
            if (!currentProduct) {
                return reply.status(404).send({
                    success: false,
                    error: 'Product not found'
                });
            }
            const relatedProducts = await index_1.prisma.product.findMany({
                where: {
                    id: { not: id },
                    isActive: true,
                    OR: [
                        { category: currentProduct.category },
                        { tags: { hasSome: currentProduct.tags } }
                    ]
                },
                include: {
                    providerMappings: {
                        where: { isActive: true }
                    },
                    _count: {
                        select: { likes: true }
                    }
                },
                take: 8,
                orderBy: { createdAt: 'desc' }
            });
            const relatedWithMinPrice = relatedProducts.map(product => {
                const minPrice = Math.min(...product.providerMappings.map(m => m.price));
                return {
                    ...product,
                    minPrice,
                    likesCount: product._count.likes,
                    _count: undefined
                };
            });
            return {
                success: true,
                data: { products: relatedWithMinPrice }
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch related products'
            });
        }
    });
    // Like/Unlike product (authenticated)
    fastify.post('/:id/like', {
        preHandler: async (request, reply) => {
            // Add auth middleware here
            // TODO: Implement JWT authentication
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user?.userId;
            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const existingLike = await index_1.prisma.productLike.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId: id
                    }
                }
            });
            if (existingLike) {
                // Unlike
                await index_1.prisma.productLike.delete({
                    where: { id: existingLike.id }
                });
                return {
                    success: true,
                    data: { liked: false }
                };
            }
            else {
                // Like
                await index_1.prisma.productLike.create({
                    data: {
                        userId,
                        productId: id
                    }
                });
                return {
                    success: true,
                    data: { liked: true }
                };
            }
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to toggle like'
            });
        }
    });
    // Get categories (public)
    fastify.get('/categories', async () => {
        try {
            const categories = await index_1.prisma.product.findMany({
                where: { isActive: true },
                select: { category: true },
                distinct: ['category']
            });
            return {
                success: true,
                data: { categories: categories.map(c => c.category) }
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to fetch categories'
            };
        }
    });
};
exports.default = productRoutes;
