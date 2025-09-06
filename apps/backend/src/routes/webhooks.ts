import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../index';
import { processProviderWebhook } from '../providers';

const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  // Printrove webhook
  fastify.post('/printrove', async (request, reply) => {
    try {
      const signature = request.headers['x-printrove-signature'] as string;
      const payload = request.body as any;

      // Log webhook event
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          provider: 'PRINTROVE',
          event: payload.event || 'unknown',
          data: payload,
          signature
        }
      });

      // Process webhook
      await processProviderWebhook('PRINTROVE', payload, signature);

      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processed: true }
      });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false });
    }
  });

  // Printful webhook
  fastify.post('/printful', async (request, reply) => {
    try {
      const signature = request.headers['x-printful-signature'] as string;
      const payload = request.body as any;

      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          provider: 'PRINTFUL',
          event: payload.type || 'unknown',
          data: payload,
          signature
        }
      });

      await processProviderWebhook('PRINTFUL', payload, signature);

      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processed: true }
      });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false });
    }
  });

  // Printify webhook
  fastify.post('/printify', async (request, reply) => {
    try {
      const signature = request.headers['x-printify-signature'] as string;
      const payload = request.body as any;

      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          provider: 'PRINTIFY',
          event: payload.type || 'unknown',
          data: payload,
          signature
        }
      });

      await processProviderWebhook('PRINTIFY', payload, signature);

      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processed: true }
      });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false });
    }
  });

  // Razorpay webhook
  fastify.post('/razorpay', async (request, reply) => {
    try {
      const signature = request.headers['x-razorpay-signature'] as string;
      const payload = request.body as any;

      // TODO: Verify Razorpay webhook signature
      // const isValid = verifyRazorpayWebhook(payload, signature);

      if (payload.event === 'payment.captured') {
        const paymentId = payload.payload.payment.entity.id;
        const orderId = payload.payload.payment.entity.notes.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              paymentId
            }
          });
        }
      }

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ success: false });
    }
  });
};

export default webhookRoutes;