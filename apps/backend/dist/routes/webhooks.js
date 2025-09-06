"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const providers_1 = require("../providers");
const webhookRoutes = async (fastify) => {
    // Printrove webhook
    fastify.post('/printrove', async (request, reply) => {
        try {
            const signature = request.headers['x-printrove-signature'];
            const payload = request.body;
            // Log webhook event
            const webhookEvent = await index_1.prisma.webhookEvent.create({
                data: {
                    provider: 'PRINTROVE',
                    event: payload.event || 'unknown',
                    data: payload,
                    signature
                }
            });
            // Process webhook
            await (0, providers_1.processProviderWebhook)('PRINTROVE', payload, signature);
            // Mark as processed
            await index_1.prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: { processed: true }
            });
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false });
        }
    });
    // Printful webhook
    fastify.post('/printful', async (request, reply) => {
        try {
            const signature = request.headers['x-printful-signature'];
            const payload = request.body;
            const webhookEvent = await index_1.prisma.webhookEvent.create({
                data: {
                    provider: 'PRINTFUL',
                    event: payload.type || 'unknown',
                    data: payload,
                    signature
                }
            });
            await (0, providers_1.processProviderWebhook)('PRINTFUL', payload, signature);
            await index_1.prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: { processed: true }
            });
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false });
        }
    });
    // Printify webhook
    fastify.post('/printify', async (request, reply) => {
        try {
            const signature = request.headers['x-printify-signature'];
            const payload = request.body;
            const webhookEvent = await index_1.prisma.webhookEvent.create({
                data: {
                    provider: 'PRINTIFY',
                    event: payload.type || 'unknown',
                    data: payload,
                    signature
                }
            });
            await (0, providers_1.processProviderWebhook)('PRINTIFY', payload, signature);
            await index_1.prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: { processed: true }
            });
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false });
        }
    });
    // Razorpay webhook
    fastify.post('/razorpay', async (request, reply) => {
        try {
            const signature = request.headers['x-razorpay-signature'];
            const payload = request.body;
            // TODO: Verify Razorpay webhook signature
            // const isValid = verifyRazorpayWebhook(payload, signature);
            if (payload.event === 'payment.captured') {
                const paymentId = payload.payload.payment.entity.id;
                const orderId = payload.payload.payment.entity.notes.orderId;
                if (orderId) {
                    await index_1.prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: 'PAID',
                            paymentId
                        }
                    });
                }
            }
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ success: false });
        }
    });
};
exports.default = webhookRoutes;
