"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const analytics_1 = require("../services/analytics");
const AnalyticsEventSchema = zod_1.z.object({
    eventName: zod_1.z.string(),
    userId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string(),
    properties: zod_1.z.record(zod_1.z.any()).optional()
});
const analyticsRoutes = async (fastify) => {
    // Track event
    fastify.post('/track', async (request, reply) => {
        try {
            const { eventName, userId, sessionId, properties } = AnalyticsEventSchema.parse(request.body);
            // Send to Google Analytics
            await (0, analytics_1.sendGAEvent)({
                name: eventName,
                params: {
                    user_id: userId,
                    session_id: sessionId,
                    ...properties
                }
            });
            return {
                success: true,
                message: 'Event tracked'
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to track event'
            });
        }
    });
    // Track purchase
    fastify.post('/purchase', async (request, reply) => {
        try {
            const { orderId, userId, sessionId, value, currency = 'INR', items } = zod_1.z.object({
                orderId: zod_1.z.string(),
                userId: zod_1.z.string().optional(),
                sessionId: zod_1.z.string(),
                value: zod_1.z.number(),
                currency: zod_1.z.string().optional(),
                items: zod_1.z.array(zod_1.z.object({
                    item_id: zod_1.z.string(),
                    item_name: zod_1.z.string(),
                    category: zod_1.z.string().optional(),
                    quantity: zod_1.z.number(),
                    price: zod_1.z.number()
                }))
            }).parse(request.body);
            await (0, analytics_1.sendGAEvent)({
                name: 'purchase',
                params: {
                    transaction_id: orderId,
                    user_id: userId,
                    session_id: sessionId,
                    value,
                    currency,
                    items
                }
            });
            return {
                success: true,
                message: 'Purchase event tracked'
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to track purchase'
            });
        }
    });
};
exports.default = analyticsRoutes;
