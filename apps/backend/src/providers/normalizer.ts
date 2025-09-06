import { ProviderType } from '@pod/shared';

interface NormalizedProduct {
  title: string;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  providerMappings: {
    provider: ProviderType;
    providerProductId: string;
    providerVariantId?: string;
    price: number;
    cost: number;
  }[];
}

export const normalizeProviderProduct = (
  providerProduct: any,
  provider: ProviderType
): NormalizedProduct => {
  let title = providerProduct.title;

  // Apply title labeling logic
  if (provider === 'PRINTROVE') {
    title += ' (India)';
  } else if (provider === 'PRINTFUL' || provider === 'PRINTIFY') {
    title += ' (International)';
  }

  const providerMappings = (providerProduct.variants || []).map((variant: any) => ({
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

export const mergeProviderProducts = (products: Array<{
  product: any;
  provider: ProviderType;
}>): NormalizedProduct[] => {
  const productMap = new Map<string, NormalizedProduct>();

  for (const { product, provider } of products) {
    const baseTitle = product.title.replace(/ \((India|International)\)$/, '');
    
    if (productMap.has(baseTitle)) {
      // Merge with existing product
      const existing = productMap.get(baseTitle)!;
      const normalized = normalizeProviderProduct(product, provider);
      
      // Remove regional suffix for merged products
      existing.title = baseTitle;
      existing.providerMappings.push(...normalized.providerMappings);
    } else {
      // Create new product
      const normalized = normalizeProviderProduct(product, provider);
      productMap.set(baseTitle, normalized);
    }
  }

  return Array.from(productMap.values());
};