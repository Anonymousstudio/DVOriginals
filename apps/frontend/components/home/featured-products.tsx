'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  minPrice: number;
  likesCount: number;
  providerMappings: Array<{
    provider: string;
    price: number;
  }>;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=8&featured=true`
      );
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    // Add to cart logic
    toast({
      title: 'Added to Cart',
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleLike = async (productId: string) => {
    // Like logic - requires authentication
    toast({
      title: 'Sign in Required',
      description: 'Please sign in to like products.',
      variant: 'destructive',
    });
  };

  if (loading) {
    return <FeaturedProductsSkeleton />;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="bg-festival-orange text-white mb-4">
            Featured Products
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Best Sellers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular custom printed products loved by our customers. 
            Premium quality, vibrant colors, and fast delivery guaranteed.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 card-hover"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLike(product.id)}
                    className="rounded-full p-2"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="rounded-full p-2 bg-festival-orange hover:bg-festival-orange/90"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Price Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white text-gray-900">
                    ₹{product.minPrice}
                  </Badge>
                </div>

                {/* Provider Badge */}
                {product.providerMappings.length > 1 && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-festival-orange text-white text-xs">
                      Multi-Region
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Heart className="w-3 h-3" />
                      <span>{product.likesCount}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    <Link 
                      href={`/products/${product.id}`}
                      className="hover:text-festival-orange transition-colors"
                    >
                      {product.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{product.minPrice}
                      </div>
                      {product.providerMappings.length > 1 && (
                        <div className="text-xs text-gray-500">
                          Starting from
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="h-6 w-32 bg-gray-300 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-80 bg-gray-300 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-300 rounded mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-300 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
                <div className="h-5 w-full bg-gray-300 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-6 w-16 bg-gray-300 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}