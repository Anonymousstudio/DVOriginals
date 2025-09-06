"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const index_1 = require("../index");
const offerRoutes = async (fastify) => {
    // Get active offers (public)
    fastify.get('/active', async (request, reply) => {
        try {
            const now = new Date();
            const offers = await index_1.prisma.offer.findMany({
                where: {
                    isActive: true,
                    validFrom: { lte: now },
                    validTo: { gte: now }
                },
                include: {
                    products: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    images: true
                                }
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
    // Get offer by ID (public)
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const now = new Date();
            const offer = await index_1.prisma.offer.findFirst({
                where: {
                    id,
                    isActive: true,
                    validFrom: { lte: now },
                    validTo: { gte: now }
                },
                include: {
                    products: {
                        include: {
                            product: {
                                include: {
                                    providerMappings: {
                                        where: { isActive: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!offer) {
                return reply.status(404).send({
                    success: false,
                    error: 'Offer not found or expired'
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
                error: 'Failed to fetch offer'
            });
        }
    });
    // Apply offer to cart (helper function)
    fastify.post('/apply', async (request, reply) => {
        try {
            const { offerId, cartTotal, productIds } = zod_1.z.object({
                offerId: zod_1.z.string(),
                cartTotal: zod_1.z.number(),
                productIds: zod_1.z.array(zod_1.z.string()).optional()
            }).parse(request.body);
            const now = new Date();
            const offer = await index_1.prisma.offer.findFirst({
                where: {
                    id: offerId,
                    isActive: true,
                    validFrom: { lte: now },
                    validTo: { gte: now }
                },
                include: {
                    products: true
                }
            });
            if (!offer) {
                return reply.status(404).send({
                    success: false,
                    error: 'Offer not found or expired'
                });
            }
            // Check usage limit
            if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
                return reply.status(400).send({
                    success: false,
                    error: 'Offer usage limit exceeded'
                });
            }
            // Check minimum order value
            if (offer.minOrderValue && cartTotal < offer.minOrderValue) {
                return reply.status(400).send({
                    success: false,
                    error: `Minimum order value of ₹${offer.minOrderValue} required`
                });
            }
            // Check offer scope
            let applicable = false;
            if (offer.scope === 'SITEWIDE') {
                applicable = true;
            }
            else if (offer.scope === 'PRODUCT' && productIds) {
                const offerProductIds = offer.products.map(p => p.productId);
                applicable = productIds.some(id => offerProductIds.includes(id));
            }
            if (!applicable) {
                return reply.status(400).send({
                    success: false,
                    error: 'Offer not applicable to current cart'
                });
            }
            // Calculate discount
            let discount = 0;
            if (offer.type === 'PERCENTAGE') {
                discount = (cartTotal * offer.value) / 100;
            }
            else if (offer.type === 'FIXED_AMOUNT') {
                discount = offer.value;
            }
            // Apply maximum discount limit
            if (offer.maxDiscount && discount > offer.maxDiscount) {
                discount = offer.maxDiscount;
            }
            // Ensure discount doesn't exceed cart total
            discount = Math.min(discount, cartTotal);
            return {
                success: true,
                data: {
                    offer,
                    discount,
                    finalTotal: cartTotal - discount
                }
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to apply offer'
            });
        }
    });
};
exports.default = offerRoutes;
