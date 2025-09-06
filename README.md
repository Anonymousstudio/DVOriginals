# PrintCraft Store - Full-Stack E-commerce POD Platform

A comprehensive Print-on-Demand e-commerce platform with unified catalog management, multi-provider support, and admin dashboard. Built with Next.js 14, Node.js, PostgreSQL, and modern web technologies.

## 🚀 Features

### Storefront
- **SEO-Optimized**: Server-side rendering, JSON-LD structured data, meta tags, sitemap
- **Unified Catalog**: Single product model with multi-provider mappings (Printrove, Printful, Printify)
- **Smart Routing**: Automatic provider selection based on region and preferences
- **Payment Integration**: Razorpay for INR payments with fallback payment links
- **Social Features**: Product likes, sharing (WhatsApp, Facebook, Twitter), wishlist
- **Google Analytics**: GA4 integration with server-side measurement protocol

### Admin Dashboard
- **Order Management**: Track orders across providers, resubmit failed orders
- **Product Management**: Unified product catalog with provider mappings
- **Offers Management**: Create sitewide/product/category offers with scheduling
- **Provider Connect**: Secure API key management with encryption
- **Analytics**: Sales dashboard, top products, order insights
- **Webhook Handling**: Provider webhook verification and processing

### Technical Architecture
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Fastify, TypeScript, REST API
- **Database**: PostgreSQL with Prisma ORM
- **Jobs**: BullMQ + Redis for background processing
- **Auth**: NextAuth for customer and admin sessions
- **Monorepo**: pnpm workspaces for organized codebase

## 📁 Project Structure

```
pod-ecommerce-monorepo/
├── apps/
│   ├── frontend/          # Next.js storefront
│   └── backend/           # Node.js API server
├── packages/
│   └── shared/            # Shared types and utilities
├── .env.example           # Environment variables template
├── package.json           # Root package.json
└── pnpm-workspace.yaml    # Workspace configuration
```

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- PostgreSQL 12+
- Redis 6+

### 1. Clone and Install
```bash
git clone <your-repo>
cd pod-ecommerce-monorepo
pnpm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

#### Database
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pod_ecommerce"
# For development: DATABASE_URL="file:./dev.db"
```

#### Redis
```env
REDIS_URL="redis://localhost:6379"
```

#### Authentication
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

#### Razorpay
```env
RAZORPAY_KEY_ID="rzp_test_xxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxxxxx"
```

#### Provider API Keys (encrypted at rest)
```env
PRINTROVE_API_KEY="your-printrove-api-key"
PRINTFUL_API_KEY="your-printful-api-key"
PRINTIFY_API_KEY="your-printify-api-key"
PRINTIFY_SHOP_ID="your-printify-shop-id"
```

#### Google Analytics
```env
GA_MEASUREMENT_ID="G-XXXXXXXXXX"
GA_API_SECRET="your-ga-api-secret"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### 3. Database Setup
```bash
# Push database schema
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Seed sample data
pnpm db:seed
```

### 4. Development
```bash
# Start all services (frontend + backend)
pnpm dev

# Or start individually:
cd apps/frontend && pnpm dev  # http://localhost:3000
cd apps/backend && pnpm dev   # http://localhost:4000
```

### 5. Production Build
```bash
pnpm build
pnpm start
```

## 🔌 Provider Integration

### Current Status
All provider adapters are implemented with mock data. To enable real integrations:

### Printrove (India)
1. Add API documentation to `apps/backend/src/providers/printrove.ts`
2. Replace mock responses with actual API calls
3. Implement webhook signature verification
4. Test with Printrove sandbox

### Printful (International)
1. API docs: https://developers.printful.com/docs/
2. Update `apps/backend/src/providers/printful.ts`
3. Uncomment API calls and add error handling
4. Set up webhook endpoints

### Printify (International)
1. API docs: https://developers.printify.com/
2. Update `apps/backend/src/providers/printify.ts`
3. Configure shop ID and API key
4. Implement order submission flow

See `apps/backend/src/providers/README.md` for detailed integration steps.

## 🧪 Testing

### Backend API Testing
```bash
# Test order creation
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "product-id", "quantity": 1}],
    "shippingAddress": {...},
    "email": "test@example.com"
  }'

# Test product listing
curl http://localhost:4000/api/products
```

### Admin Access
- URL: http://localhost:3000/admin
- Email: admin@example.com (from .env)
- Password: admin123 (from .env)

## 🎯 Key Features Implementation

### 1. Unified Catalog
Products have multiple provider mappings with automatic title labeling:
- Printrove products: " (India)"
- Printful/Printify: " (International)"  
- Multi-provider products: No suffix

### 2. Smart Provider Routing
Order fulfillment automatically selects optimal provider based on:
- Customer location
- Product availability
- Admin preferences
- Cost optimization

### 3. Offer Management
Admin can create:
- Sitewide percentage/fixed discounts
- Product-specific offers
- Category-based promotions
- Time-limited campaigns

### 4. SEO Optimization
- Server-side rendering for all product pages
- JSON-LD structured data
- Dynamic sitemap generation
- Open Graph and Twitter cards
- Canonical URLs

## 🔒 Security Features

- **Encrypted Settings**: Provider API keys encrypted at rest
- **Webhook Verification**: All provider webhooks verified
- **JWT Authentication**: Secure session management  
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Zod schemas for all endpoints

## 📊 Analytics & Monitoring

### Google Analytics Integration
- Page views and user interactions
- E-commerce tracking (purchases, cart events)
- Server-side measurement protocol
- Custom event tracking

### Admin Dashboard
- Real-time order statistics
- Revenue and product analytics
- Provider performance metrics
- Customer behavior insights

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure PostgreSQL database
3. Set up Redis instance
4. Configure Razorpay webhook URLs

### Database Migration
```bash
NODE_ENV=production pnpm db:migrate
NODE_ENV=production pnpm db:seed
```

### Production Build
```bash
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@printcraft.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🎉 Acknowledgments

- **Printrove**: India print-on-demand partner
- **Printful**: International fulfillment
- **Printify**: Global product catalog
- **Razorpay**: Payment processing
- **Vercel/Netlify**: Deployment platforms

---

**Made with ❤️ for the Print-on-Demand community**