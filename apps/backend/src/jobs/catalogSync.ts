import { Job } from 'bullmq';
import { prisma } from '../index';
import { getProviderAdapter } from '../providers';
import { normalizeProviderProduct } from '../providers/normalizer';
import { ProviderType } from '@pod/shared';

export const catalogSync = async (job: Job) => {
  const { provider } = job.data;

  try {
    console.log(`Starting catalog sync for ${provider}`);

    const adapter = getProviderAdapter(provider as ProviderType);
    const products = await adapter.listProducts();

    console.log(`Fetched ${products.length} products from ${provider}`);

    for (const providerProduct of products) {
      const normalizedProduct = normalizeProviderProduct(providerProduct, provider);

      // Check if product already exists (by title or provider product ID)
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { title: normalizedProduct.title },
            {
              providerMappings: {
                some: {
                  provider: provider,
                  providerProductId: providerProduct.id
                }
              }
            }
          ]
        },
        include: {
          providerMappings: true
        }
      });

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            title: normalizedProduct.title,
            description: normalizedProduct.description,
            images: normalizedProduct.images,
            category: normalizedProduct.category,
            tags: normalizedProduct.tags,
            providerMappings: {
              deleteMany: {
                provider: provider
              },
              create: normalizedProduct.providerMappings
            }
          }
        });
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            title: normalizedProduct.title,
            description: normalizedProduct.description,
            images: normalizedProduct.images,
            category: normalizedProduct.category,
            tags: normalizedProduct.tags,
            seoTitle: `${normalizedProduct.title} - Buy Online`,
            seoDescription: normalizedProduct.description.substring(0, 160),
            providerMappings: {
              create: normalizedProduct.providerMappings
            }
          }
        });
      }
    }

    console.log(`Catalog sync completed for ${provider}`);
  } catch (error) {
    console.error(`Catalog sync failed for ${provider}:`, error);
    throw error;
  }
};