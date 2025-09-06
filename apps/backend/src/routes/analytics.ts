import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { sendGAEvent } from '../services/analytics';

const AnalyticsEventSchema = z.object({
  eventName: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  properties: z.record(z.any()).optional()
});

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  // Track event
  fastify.post('/track', async (request, reply) => {
    try {
      const { eventName, userId, sessionId, properties } = AnalyticsEventSchema.parse(request.body);

      // Send to Google Analytics
      await sendGAEvent({
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
    } catch (error) {
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
      const { orderId, userId, sessionId, value, currency = 'INR', items } = z.object({
        orderId: z.string(),
        userId: z.string().optional(),
        sessionId: z.string(),
        value: z.number(),
        currency: z.string().optional(),
        items: z.array(z.object({
          item_id: z.string(),
          item_name: z.string(),
          category: z.string().optional(),
          quantity: z.number(),
          price: z.number()
        }))
      }).parse(request.body);

      await sendGAEvent({
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
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to track purchase'
      });
    }
  });
};

export default analyticsRoutes;