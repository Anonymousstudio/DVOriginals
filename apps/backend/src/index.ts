import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { Worker } from 'bullmq';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import offerRoutes from './routes/offers';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';
import analyticsRoutes from './routes/analytics';

// Import jobs
import { orderProcessor } from './jobs/orderProcessor';
import { catalogSync } from './jobs/catalogSync';

// Initialize Prisma and Redis
export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

// Register plugins
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001'] 
    : [process.env.FRONTEND_URL || 'https://yourdomain.com'],
  credentials: true,
});

fastify.register(multipart);

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(productRoutes, { prefix: '/api/products' });
fastify.register(orderRoutes, { prefix: '/api/orders' });
fastify.register(cartRoutes, { prefix: '/api/cart' });
fastify.register(offerRoutes, { prefix: '/api/offers' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(webhookRoutes, { prefix: '/api/webhooks' });
fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

// Initialize background workers
const orderWorker = new Worker('orderQueue', orderProcessor, { connection: redis });
const syncWorker = new Worker('syncQueue', catalogSync, { connection: redis });

orderWorker.on('completed', (job) => {
  fastify.log.info(`Order job ${job.id} completed`);
});

orderWorker.on('failed', (job, err) => {
  fastify.log.error(`Order job ${job?.id} failed:`, err);
});

syncWorker.on('completed', (job) => {
  fastify.log.info(`Sync job ${job.id} completed`);
});

syncWorker.on('failed', (job, err) => {
  fastify.log.error(`Sync job ${job?.id} failed:`, err);
});

// Graceful shutdown
const shutdown = async () => {
  await orderWorker.close();
  await syncWorker.close();
  await redis.disconnect();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
const start = async () => {
  try {
    await fastify.listen({ 
      port: parseInt(process.env.API_PORT || '4000'), 
      host: '0.0.0.0' 
    });
    
    fastify.log.info(`🚀 Backend server running on port ${process.env.API_PORT || 4000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();