import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["USER", "ADMIN"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
    name?: string | undefined;
}, {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
    name?: string | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const ProviderType: z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>;
export type ProviderType = z.infer<typeof ProviderType>;
export declare const ProviderMappingSchema: z.ZodObject<{
    provider: z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>;
    providerProductId: z.ZodString;
    providerVariantId: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    cost: z.ZodNumber;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
    providerProductId: string;
    price: number;
    cost: number;
    isActive: boolean;
    providerVariantId?: string | undefined;
}, {
    provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
    providerProductId: string;
    price: number;
    cost: number;
    providerVariantId?: string | undefined;
    isActive?: boolean | undefined;
}>;
export type ProviderMapping = z.infer<typeof ProviderMappingSchema>;
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    isActive: z.ZodBoolean;
    providerMappings: z.ZodArray<z.ZodObject<{
        provider: z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>;
        providerProductId: z.ZodString;
        providerVariantId: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        cost: z.ZodNumber;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        isActive: boolean;
        providerVariantId?: string | undefined;
    }, {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        providerVariantId?: string | undefined;
        isActive?: boolean | undefined;
    }>, "many">;
    seoTitle: z.ZodOptional<z.ZodString>;
    seoDescription: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    title: string;
    description: string;
    images: string[];
    category: string;
    tags: string[];
    providerMappings: {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        isActive: boolean;
        providerVariantId?: string | undefined;
    }[];
    seoTitle?: string | undefined;
    seoDescription?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    title: string;
    description: string;
    images: string[];
    category: string;
    tags: string[];
    providerMappings: {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        providerVariantId?: string | undefined;
        isActive?: boolean | undefined;
    }[];
    seoTitle?: string | undefined;
    seoDescription?: string | undefined;
}>;
export type Product = z.infer<typeof ProductSchema>;
export declare const OrderStatus: z.ZodEnum<["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]>;
export declare const OrderItemSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    providerMapping: z.ZodObject<{
        provider: z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>;
        providerProductId: z.ZodString;
        providerVariantId: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        cost: z.ZodNumber;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        isActive: boolean;
        providerVariantId?: string | undefined;
    }, {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        providerVariantId?: string | undefined;
        isActive?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    price: number;
    productId: string;
    quantity: number;
    providerMapping: {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        isActive: boolean;
        providerVariantId?: string | undefined;
    };
}, {
    id: string;
    price: number;
    productId: string;
    quantity: number;
    providerMapping: {
        provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
        providerProductId: string;
        price: number;
        cost: number;
        providerVariantId?: string | undefined;
        isActive?: boolean | undefined;
    };
}>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        productId: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        providerMapping: z.ZodObject<{
            provider: z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>;
            providerProductId: z.ZodString;
            providerVariantId: z.ZodOptional<z.ZodString>;
            price: z.ZodNumber;
            cost: z.ZodNumber;
            isActive: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
            providerProductId: string;
            price: number;
            cost: number;
            isActive: boolean;
            providerVariantId?: string | undefined;
        }, {
            provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
            providerProductId: string;
            price: number;
            cost: number;
            providerVariantId?: string | undefined;
            isActive?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        price: number;
        productId: string;
        quantity: number;
        providerMapping: {
            provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
            providerProductId: string;
            price: number;
            cost: number;
            isActive: boolean;
            providerVariantId?: string | undefined;
        };
    }, {
        id: string;
        price: number;
        productId: string;
        quantity: number;
        providerMapping: {
            provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
            providerProductId: string;
            price: number;
            cost: number;
            providerVariantId?: string | undefined;
            isActive?: boolean | undefined;
        };
    }>, "many">;
    subtotal: z.ZodNumber;
    shipping: z.ZodNumber;
    tax: z.ZodNumber;
    total: z.ZodNumber;
    paymentId: z.ZodOptional<z.ZodString>;
    providerOrderId: z.ZodOptional<z.ZodString>;
    shippingAddress: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodString;
        pincode: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        line1: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        line2?: string | undefined;
    }, {
        name: string;
        phone: string;
        line1: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        line2?: string | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
    createdAt: Date;
    updatedAt: Date;
    items: {
        id: string;
        price: number;
        productId: string;
        quantity: number;
        providerMapping: {
            provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
            providerProductId: string;
            price: number;
            cost: number;
            isActive: boolean;
            providerVariantId?: string | undefined;
        };
    }[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: {
        name: string;
        phone: string;
        line1: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        line2?: string | undefined;
    };
    userId?: string | undefined;
    phone?: string | undefined;
    paymentId?: string | undefined;
    providerOrderId?: string | undefined;
}, {
    id: string;
    email: string;
    status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
    createdAt: Date;
    updatedAt: Date;
    items: {
        id: string;
        price: number;
        productId: string;
        quantity: number;
        providerMapping: {
            provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
            providerProductId: string;
            price: number;
            cost: number;
            providerVariantId?: string | undefined;
            isActive?: boolean | undefined;
        };
    }[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: {
        name: string;
        phone: string;
        line1: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        line2?: string | undefined;
    };
    userId?: string | undefined;
    phone?: string | undefined;
    paymentId?: string | undefined;
    providerOrderId?: string | undefined;
}>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatus>;
export declare const CartItemSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    selectedProvider: z.ZodOptional<z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    selectedProvider?: "PRINTROVE" | "PRINTFUL" | "PRINTIFY" | undefined;
}, {
    productId: string;
    quantity: number;
    selectedProvider?: "PRINTROVE" | "PRINTFUL" | "PRINTIFY" | undefined;
}>;
export declare const CartSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        selectedProvider: z.ZodOptional<z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>>;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        selectedProvider?: "PRINTROVE" | "PRINTFUL" | "PRINTIFY" | undefined;
    }, {
        productId: string;
        quantity: number;
        selectedProvider?: "PRINTROVE" | "PRINTFUL" | "PRINTIFY" | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
        selectedProvider?: "PRINTROVE" | "PRINTFUL" | "PRINTIFY" | undefined;
    }[];
}, {
    items: {
        productId: string;
        quantity: number;
        selectedProvider?: "PRINTROVE" | "PRINTFUL" | "PRINTIFY" | undefined;
    }[];
}>;
export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export declare const OfferTypeSchema: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
export declare const OfferScopeSchema: z.ZodEnum<["SITEWIDE", "PRODUCT", "CATEGORY"]>;
export declare const OfferSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
    scope: z.ZodEnum<["SITEWIDE", "PRODUCT", "CATEGORY"]>;
    value: z.ZodNumber;
    minOrderValue: z.ZodOptional<z.ZodNumber>;
    maxDiscount: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodDate;
    validTo: z.ZodDate;
    isActive: z.ZodBoolean;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    usedCount: z.ZodDefault<z.ZodNumber>;
    productIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    value: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    title: string;
    description: string;
    scope: "SITEWIDE" | "PRODUCT" | "CATEGORY";
    validFrom: Date;
    validTo: Date;
    usedCount: number;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    productIds?: string[] | undefined;
    categoryIds?: string[] | undefined;
}, {
    id: string;
    value: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    title: string;
    description: string;
    scope: "SITEWIDE" | "PRODUCT" | "CATEGORY";
    validFrom: Date;
    validTo: Date;
    minOrderValue?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    usedCount?: number | undefined;
    productIds?: string[] | undefined;
    categoryIds?: string[] | undefined;
}>;
export type Offer = z.infer<typeof OfferSchema>;
export declare const AnalyticsEventSchema: z.ZodObject<{
    eventName: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    properties: z.ZodRecord<z.ZodString, z.ZodAny>;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    eventName: string;
    sessionId: string;
    properties: Record<string, any>;
    timestamp: Date;
    userId?: string | undefined;
}, {
    eventName: string;
    sessionId: string;
    properties: Record<string, any>;
    timestamp: Date;
    userId?: string | undefined;
}>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    data?: any;
    error?: string | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    data?: any;
    error?: string | undefined;
}>;
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};
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
    files?: {
        url: string;
        type: string;
    }[];
}
export declare const WebhookEventSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["PRINTROVE", "PRINTFUL", "PRINTIFY"]>;
    event: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    signature: z.ZodOptional<z.ZodString>;
    processed: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
    data: Record<string, any>;
    event: string;
    processed: boolean;
    signature?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    provider: "PRINTROVE" | "PRINTFUL" | "PRINTIFY";
    data: Record<string, any>;
    event: string;
    signature?: string | undefined;
    processed?: boolean | undefined;
}>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
