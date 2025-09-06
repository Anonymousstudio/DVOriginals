'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Shield, Truck, Star } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    title: 'Create Your Perfect Custom Products',
    subtitle: 'Premium Quality • Fast Delivery • India & International',
    description: 'From t-shirts to home decor, bring your ideas to life with our high-quality print-on-demand service. Free shipping on orders above ₹500.',
    image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
    cta: 'Start Creating',
    ctaLink: '/products',
    badge: 'Festival Special'
  },
  {
    id: 2,
    title: 'Worldwide Shipping Available',
    subtitle: 'India via Printrove • International via Printful & Printify',
    description: 'Whether you\'re in Mumbai or New York, get your custom products delivered fast. Choose from our unified catalog with global provider options.',
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
    cta: 'Shop Global',
    ctaLink: '/products?shipping=international',
    badge: 'Global Delivery'
  },
  {
    id: 3,
    title: 'Diwali Special Offers',
    subtitle: '20% Off on All Products • Limited Time',
    description: 'Celebrate the festival of lights with custom products for your home and family. Use code DIWALI20 for extra savings on bulk orders.',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    cta: 'Shop Offers',
    ctaLink: '/offers',
    badge: '20% Off'
  }
];

const features = [
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'High-grade materials and vibrant printing'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick shipping across India and worldwide'
  },
  {
    icon: Shield,
    title: 'Money Back Guarantee',
    description: '100% satisfaction or full refund'
  },
  {
    icon: Star,
    title: '4.8/5 Rating',
    description: 'Loved by 10,000+ happy customers'
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
      
      {/* Main Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <Badge className="bg-festival-orange text-white px-3 py-1">
                {currentHero.badge}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {currentHero.title}
              </h1>
              
              <p className="text-xl text-orange-200 font-medium">
                {currentHero.subtitle}
              </p>
              
              <p className="text-lg text-gray-300 max-w-xl">
                {currentHero.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-festival-orange hover:bg-festival-orange/90 text-white px-8 py-3 text-lg"
                asChild
              >
                <Link href={currentHero.ctaLink}>
                  {currentHero.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg"
                asChild
              >
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-festival-orange' : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={currentHero.image}
                alt={currentHero.title}
                fill
                className="object-cover transition-all duration-1000 ease-in-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-xl shadow-xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Products Sold</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.8★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center space-y-3 p-4 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-festival-orange rounded-lg text-white">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}