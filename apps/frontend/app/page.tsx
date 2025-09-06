import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { ActiveOffers } from '@/components/home/active-offers';
import { CategoryGrid } from '@/components/home/category-grid';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { CTASection } from '@/components/home/cta-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'PrintCraft Store - Custom Print-on-Demand Products | Fast Delivery India',
  description: 'Discover premium custom printed t-shirts, hoodies, mugs, and home decor. High-quality materials, vibrant colors, and fast delivery across India and worldwide.',
  keywords: 'custom printing, print on demand, t-shirts, hoodies, mugs, personalized gifts, India, international shipping, Printrove, Printful, Printify',
  openGraph: {
    title: 'PrintCraft Store - Custom Print-on-Demand Products',
    description: 'Premium custom printed products with fast delivery across India and worldwide',
    url: 'https://yourdomain.com',
    siteName: 'PrintCraft Store',
    images: [
      {
        url: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
        width: 1200,
        height: 630,
        alt: 'Custom printed t-shirts and products',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrintCraft Store - Custom Print-on-Demand Products',
    description: 'Premium custom printed products with fast delivery',
    images: ['https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg'],
  },
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'PrintCraft Store',
    'description': 'Premium custom print-on-demand products with fast delivery',
    'url': 'https://yourdomain.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://yourdomain.com/products?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    'sameAs': [
      'https://facebook.com/printcraft',
      'https://twitter.com/printcraft',
      'https://instagram.com/printcraft'
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      
      <main className="min-h-screen">
        <HeroSection />
        <ActiveOffers />
        <FeaturedProducts />
        <CategoryGrid />
        <TestimonialsSection />
        <CTASection />
      </main>
      
      <Footer />
    </>
  );
}