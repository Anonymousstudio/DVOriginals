import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: Role.ADMIN
      }
    });

    console.log('✅ Admin user created:', admin.email);

    // Create sample products
    const sampleProducts = [
      {
        title: 'Custom T-Shirt (India)',
        description: 'Premium cotton t-shirt with custom printing. Perfect for personal use or gifting.',
        images: [
          'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg',
          'https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg'
        ],
        category: 'Apparel',
        tags: ['t-shirt', 'custom', 'cotton', 'unisex'],
        seoTitle: 'Custom T-Shirt - Premium Cotton Tee - Buy Online India',
        seoDescription: 'High-quality custom printed t-shirts made from premium cotton. Perfect fit, vibrant colors, fast delivery across India.',
        providerMappings: [
          {
            provider: 'PRINTROVE' as const,
            providerProductId: 'printrove-tshirt-001',
            providerVariantId: 'var-001',
            price: 299,
            cost: 150
          }
        ]
      },
      {
        title: 'International Hoodie (International)',
        description: 'Comfortable hoodie with custom design printing. Available for worldwide shipping.',
        images: [
          'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
          'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg'
        ],
        category: 'Apparel',
        tags: ['hoodie', 'custom', 'warm', 'comfortable'],
        seoTitle: 'Custom Hoodie - Premium Quality - International Shipping',
        seoDescription: 'Soft, comfortable hoodies with custom printing. High-quality materials, perfect for any season.',
        providerMappings: [
          {
            provider: 'PRINTFUL' as const,
            providerProductId: 'printful-hoodie-001',
            providerVariantId: 'var-printful-001',
            price: 1299,
            cost: 800
          }
        ]
      },
      {
        title: 'Custom Coffee Mug (International)',
        description: 'Personalized ceramic coffee mug. Perfect for home or office use.',
        images: [
          'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
          'https://images.pexels.com/photos/302900/pexels-photo-302900.jpeg'
        ],
        category: 'Home & Living',
        tags: ['mug', 'coffee', 'custom', 'ceramic'],
        seoTitle: 'Custom Coffee Mug - Personalized Ceramic Mug - Order Online',
        seoDescription: 'High-quality ceramic mugs with custom printing. Dishwasher safe, perfect for daily use.',
        providerMappings: [
          {
            provider: 'PRINTIFY' as const,
            providerProductId: 'printify-mug-001',
            providerVariantId: 'var-printify-001',
            price: 799,
            cost: 400
          }
        ]
      },
      {
        title: 'Premium Poster Print',
        description: 'High-quality poster prints available in multiple sizes. Perfect for home decoration.',
        images: [
          'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
          'https://images.pexels.com/photos/1267321/pexels-photo-1267321.jpeg'
        ],
        category: 'Home & Living',
        tags: ['poster', 'print', 'decoration', 'wall-art'],
        seoTitle: 'Custom Poster Prints - High Quality Wall Art - Multiple Sizes',
        seoDescription: 'Professional quality poster prints on premium paper. Various sizes available for any space.',
        providerMappings: [
          {
            provider: 'PRINTROVE' as const,
            providerProductId: 'printrove-poster-001',
            providerVariantId: 'var-poster-001',
            price: 199,
            cost: 100
          },
          {
            provider: 'PRINTFUL' as const,
            providerProductId: 'printful-poster-001',
            providerVariantId: 'var-printful-poster-001',
            price: 599,
            cost: 300
          }
        ]
      }
    ];

    for (const productData of sampleProducts) {
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          images: productData.images,
          category: productData.category,
          tags: productData.tags,
          seoTitle: productData.seoTitle,
          seoDescription: productData.seoDescription,
          isActive: true,
          providerMappings: {
            create: productData.providerMappings
          }
        },
        include: {
          providerMappings: true
        }
      });

      console.log('✅ Product created:', product.title);
    }

    // Create sample offers
    const sampleOffers = [
      {
        title: 'Diwali Special - 20% Off',
        description: 'Celebrate Diwali with 20% off on all products. Limited time offer!',
        type: 'PERCENTAGE' as const,
        scope: 'SITEWIDE' as const,
        value: 20,
        minOrderValue: 500,
        maxDiscount: 500,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        usageLimit: 1000
      },
      {
        title: 'Buy 2 Get 1 Free - T-Shirts',
        description: 'Special offer on t-shirts - buy 2 and get 1 absolutely free!',
        type: 'PERCENTAGE' as const,
        scope: 'CATEGORY' as const,
        value: 33,
        minOrderValue: 598,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        isActive: true,
        usageLimit: 500
      }
    ];

    for (const offerData of sampleOffers) {
      const offer = await prisma.offer.create({
        data: offerData
      });

      console.log('✅ Offer created:', offer.title);
    }

    // Create sample settings
    const sampleSettings = [
      {
        key: 'SITE_NAME',
        value: 'PrintCraft Store'
      },
      {
        key: 'SITE_DESCRIPTION',
        value: 'Your one-stop shop for custom printed products'
      },
      {
        key: 'SHIPPING_COST_THRESHOLD',
        value: '500'
      },
      {
        key: 'GST_RATE',
        value: '18'
      }
    ];

    for (const setting of sampleSettings) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      });
    }

    console.log('✅ Settings created');

    console.log('🎉 Database seed completed successfully!');
    
    console.log('\n📊 Summary:');
    console.log(`- Admin user: ${admin.email}`);
    console.log(`- Products: ${sampleProducts.length}`);
    console.log(`- Offers: ${sampleOffers.length}`);
    console.log(`- Settings: ${sampleSettings.length}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default seed;