import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductDetails } from '@/components/product/product-details';
import { ProductImages } from '@/components/product/product-images';
import { ProductActions } from '@/components/product/product-actions';
import { RelatedProducts } from '@/components/product/related-products';
import { ProductReviews } from '@/components/product/product-reviews';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data.product : null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found - PrintCraft Store',
    };
  }

  const price = product.providerMappings.length > 0 
    ? Math.min(...product.providerMappings.map((m: any) => m.price))
    : 0;

  return {
    title: product.seoTitle || `${product.title} - PrintCraft Store`,
    description: product.seoDescription || product.description.substring(0, 160),
    keywords: product.tags?.join(', '),
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images?.map((image: string) => ({
        url: image,
        width: 800,
        height: 600,
        alt: product.title,
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const price = product.providerMappings.length > 0 
    ? Math.min(...product.providerMappings.map((m: any) => m.price))
    : 0;

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.title,
    'description': product.description,
    'image': product.images,
    'category': product.category,
    'brand': {
      '@type': 'Brand',
      'name': 'PrintCraft Store'
    },
    'offers': {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': 'INR',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': 'PrintCraft Store'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.5',
      'reviewCount': '89'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` },
              { label: product.title }
            ]}
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <ProductImages images={product.images} title={product.title} />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <ProductDetails product={product} />
              <ProductActions product={product} />
            </div>
          </div>

          {/* Product Reviews */}
          <div className="mt-16">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <RelatedProducts productId={product.id} />
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}