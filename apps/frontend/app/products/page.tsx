import { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductSearch } from '@/components/products/product-search';
import { ProductSkeleton } from '@/components/products/product-skeleton';

export const metadata: Metadata = {
  title: 'All Products - PrintCraft Store | Custom Print-on-Demand',
  description: 'Browse our complete collection of custom printed products. T-shirts, hoodies, mugs, posters, and more. Filter by category, price, and shipping region.',
  keywords: 'products, custom printing, t-shirts, hoodies, mugs, posters, home decor, apparel, personalized gifts',
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              All Products
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Discover our complete collection of custom printed products. 
              High-quality materials, vibrant colors, and fast delivery.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <ProductSearch />
                <ProductFilters />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}