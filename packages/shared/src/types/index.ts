import { z } from 'zod';

// User Types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type User = z.infer<typeof UserSchema>;

// Provider Types
export const ProviderType = z.enum(['PRINTROVE', 'PRINTFUL', 'PRINTIFY']);
export type ProviderType = z.infer<typeof ProviderType>;

export const ProviderMappingSchema = z.object({
  provider: ProviderType,
  providerProductId: z.string(),
  providerVariantId: z.string().optional(),
  price: z.number(),
  cost: z.number(),
  isActive: z.boolean().default(true)
});

export type ProviderMapping = z.infer<typeof ProviderMappingSchema>;

// Product Types
export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  category: z.string(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  providerMappings: z.array(ProviderMappingSchema),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Product = z.infer<typeof ProductSchema>;

// Order Types
export const OrderStatus = z.enum([
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
]);

export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number(),
  price: z.number(),
  providerMapping: ProviderMappingSchema
});

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: OrderStatus,
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  paymentId: z.string().optional(),
  providerOrderId: z.string().optional(),
  shippingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    pincode: z.string()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatus>;

// Cart Types
export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  selectedProvider: ProviderType.optional()
});

export const CartSchema = z.object({
  items: z.array(CartItemSchema)
});

export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;

// Offer Types
export const OfferTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);
export const OfferScopeSchema = z.enum(['SITEWIDE', 'PRODUCT', 'CATEGORY']);

export const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: OfferTypeSchema,
  scope: OfferScopeSchema,
  value: z.number(),
  minOrderValue: z.number().optional(),
  maxDiscount: z.number().optional(),
  validFrom: z.date(),
  validTo: z.date(),
  isActive: z.boolean(),
  usageLimit: z.number().optional(),
  usedCount: z.number().default(0),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Offer = z.infer<typeof OfferSchema>;

// Analytics Types
export const AnalyticsEventSchema = z.object({
  eventName: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  properties: z.record(z.any()),
  timestamp: z.date()
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Provider API Types
export interface ProviderProduct {
  id: string;
  title: string;
  description: string;
  images: string[];
  variants: ProviderVariant[];
  category?: string;
  tags?: string[];
}

export interface ProviderVariant {
  id: string;
  title: string;
  price: number;
  cost?: number;
  sku?: string;
  attributes: Record<string, string>;
}

export interface ProviderOrder {
  id: string;
  status: string;
  items: ProviderOrderItem[];
  shipping: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}

export interface ProviderOrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  files?: { url: string; type: string }[];
}

// Webhook Types
export const WebhookEventSchema = z.object({
  id: z.string(),
  provider: ProviderType,
  event: z.string(),
  data: z.record(z.any()),
  signature: z.string().optional(),
  processed: z.boolean().default(false),
  createdAt: z.date()
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;