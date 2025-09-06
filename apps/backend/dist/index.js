"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.prisma = void 0;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const client_1 = require("@prisma/client");
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const cart_1 = __importDefault(require("./routes/cart"));
const offers_1 = __importDefault(require("./routes/offers"));
const admin_1 = __importDefault(require("./routes/admin"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const analytics_1 = __importDefault(require("./routes/analytics"));
// Import jobs
const orderProcessor_1 = require("./jobs/orderProcessor");
const catalogSync_1 = require("./jobs/catalogSync");
// Initialize Prisma and Redis
exports.prisma = new client_1.PrismaClient();
exports.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
const fastify = (0, fastify_1.default)({
    logger: {
        level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
});
// Register plugins
fastify.register(cors_1.default, {
    origin: process.env.NODE_ENV === 'development'
        ? ['http://localhost:3000', 'http://localhost:3001']
        : [process.env.FRONTEND_URL || 'https://yourdomain.com'],
    credentials: true,
});
fastify.register(multipart_1.default);
// Health check
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
// Register routes
fastify.register(auth_1.default, { prefix: '/api/auth' });
fastify.register(products_1.default, { prefix: '/api/products' });
fastify.register(orders_1.default, { prefix: '/api/orders' });
fastify.register(cart_1.default, { prefix: '/api/cart' });
fastify.register(offers_1.default, { prefix: '/api/offers' });
fastify.register(admin_1.default, { prefix: '/api/admin' });
fastify.register(webhooks_1.default, { prefix: '/api/webhooks' });
fastify.register(analytics_1.default, { prefix: '/api/analytics' });
// Initialize background workers
const orderWorker = new bullmq_1.Worker('orderQueue', orderProcessor_1.orderProcessor, { connection: exports.redis });
const syncWorker = new bullmq_1.Worker('syncQueue', catalogSync_1.catalogSync, { connection: exports.redis });
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
    await exports.redis.disconnect();
    await exports.prisma.$disconnect();
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
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
