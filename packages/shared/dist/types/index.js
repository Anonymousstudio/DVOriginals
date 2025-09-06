"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookEventSchema = exports.ApiResponseSchema = exports.AnalyticsEventSchema = exports.OfferSchema = exports.OfferScopeSchema = exports.OfferTypeSchema = exports.CartSchema = exports.CartItemSchema = exports.OrderSchema = exports.OrderItemSchema = exports.OrderStatus = exports.ProductSchema = exports.ProviderMappingSchema = exports.ProviderType = exports.UserSchema = void 0;
const zod_1 = require("zod");
// User Types
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    role: zod_1.z.enum(['USER', 'ADMIN']),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Provider Types
exports.ProviderType = zod_1.z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']);
exports.ProviderMappingSchema = zod_1.z.object({
    provider: exports.ProviderType,
    providerProductId: zod_1.z.string(),
    providerVariantId: zod_1.z.string().optional(),
    price: zod_1.z.number(),
    cost: zod_1.z.number(),
    isActive: zod_1.z.boolean().default(true)
});
// Product Types
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    images: zod_1.z.array(zod_1.z.string()),
    category: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    isActive: zod_1.z.boolean(),
    providerMappings: zod_1.z.array(exports.ProviderMappingSchema),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Order Types
exports.OrderStatus = zod_1.z.enum([
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
]);
exports.OrderItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    productId: zod_1.z.string(),
    quantity: zod_1.z.number(),
    price: zod_1.z.number(),
    providerMapping: exports.ProviderMappingSchema
});
exports.OrderSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    status: exports.OrderStatus,
    items: zod_1.z.array(exports.OrderItemSchema),
    subtotal: zod_1.z.number(),
    shipping: zod_1.z.number(),
    tax: zod_1.z.number(),
    total: zod_1.z.number(),
    paymentId: zod_1.z.string().optional(),
    providerOrderId: zod_1.z.string().optional(),
    shippingAddress: zod_1.z.object({
        name: zod_1.z.string(),
        phone: zod_1.z.string(),
        line1: zod_1.z.string(),
        line2: zod_1.z.string().optional(),
        city: zod_1.z.string(),
        state: zod_1.z.string(),
        country: zod_1.z.string(),
        pincode: zod_1.z.string()
    }),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Cart Types
exports.CartItemSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    selectedProvider: exports.ProviderType.optional()
});
exports.CartSchema = zod_1.z.object({
    items: zod_1.z.array(exports.CartItemSchema)
});
// Offer Types
exports.OfferTypeSchema = zod_1.z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
exports.OfferScopeSchema = zod_1.z.enum(['SITEWIDE', 'PRODUCT', 'CATEGORY']);
exports.OfferSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    type: exports.OfferTypeSchema,
    scope: exports.OfferScopeSchema,
    value: zod_1.z.number(),
    minOrderValue: zod_1.z.number().optional(),
    maxDiscount: zod_1.z.number().optional(),
    validFrom: zod_1.z.date(),
    validTo: zod_1.z.date(),
    isActive: zod_1.z.boolean(),
    usageLimit: zod_1.z.number().optional(),
    usedCount: zod_1.z.number().default(0),
    productIds: zod_1.z.array(zod_1.z.string()).optional(),
    categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
// Analytics Types
exports.AnalyticsEventSchema = zod_1.z.object({
    eventName: zod_1.z.string(),
    userId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string(),
    properties: zod_1.z.record(zod_1.z.any()),
    timestamp: zod_1.z.date()
});
// API Response Types
exports.ApiResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    message: zod_1.z.string().optional()
});
// Webhook Types
exports.WebhookEventSchema = zod_1.z.object({
    id: zod_1.z.string(),
    provider: exports.ProviderType,
    event: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.any()),
    signature: zod_1.z.string().optional(),
    processed: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.date()
});
