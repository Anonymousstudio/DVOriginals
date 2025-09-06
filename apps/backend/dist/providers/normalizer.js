"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeProviderProducts = exports.normalizeProviderProduct = void 0;
const normalizeProviderProduct = (providerProduct, provider) => {
    let title = providerProduct.title;
    // Apply title labeling logic
    if (provider === 'PRINTROVE') {
        title += ' (India)';
    }
    else if (provider === 'PRINTFUL' || provider === 'PRINTIFY') {
        title += ' (International)';
    }
    const providerMappings = (providerProduct.variants || []).map((variant) => ({
        provider,
        providerProductId: providerProduct.id,
        providerVariantId: variant.id,
        price: variant.price,
        cost: variant.cost || variant.price * 0.6 // Default 40% margin
    }));
    return {
        title,
        description: providerProduct.description || '',
        images: providerProduct.images || [],
        category: providerProduct.category || 'Uncategorized',
        tags: providerProduct.tags || [],
        providerMappings
    };
};
exports.normalizeProviderProduct = normalizeProviderProduct;
const mergeProviderProducts = (products) => {
    const productMap = new Map();
    for (const { product, provider } of products) {
        const baseTitle = product.title.replace(/ \((India|International)\)$/, '');
        if (productMap.has(baseTitle)) {
            // Merge with existing product
            const existing = productMap.get(baseTitle);
            const normalized = (0, exports.normalizeProviderProduct)(product, provider);
            // Remove regional suffix for merged products
            existing.title = baseTitle;
            existing.providerMappings.push(...normalized.providerMappings);
        }
        else {
            // Create new product
            const normalized = (0, exports.normalizeProviderProduct)(product, provider);
            productMap.set(baseTitle, normalized);
        }
    }
    return Array.from(productMap.values());
};
exports.mergeProviderProducts = mergeProviderProducts;
