import { Job } from 'bullmq';
import { prisma } from '../index';
import { getProviderAdapter } from '../providers';
import { sendGAEvent } from '../services/analytics';

export const orderProcessor = async (job: Job) => {
  const { orderId } = job.data;

  try {
    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Group items by provider
    const itemsByProvider = order.items.reduce((acc, item) => {
      const provider = item.provider;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    // Submit orders to each provider
    const providerOrders = [];

    for (const [provider, items] of Object.entries(itemsByProvider)) {
      const adapter = getProviderAdapter(provider as any);

      const providerOrderData = {
        items: items.map(item => ({
          productId: item.providerProductId,
          variantId: item.providerVariantId,
          quantity: item.quantity
        })),
        shipping: {
          name: order.shippingAddress?.name || '',
          address: order.shippingAddress?.line1 || '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          country: order.shippingAddress?.country || 'India',
          zip: order.shippingAddress?.pincode || ''
        },
        subtotal: order.subtotal,
        shipping_cost: order.shipping,
        tax: order.tax
      };

      const providerOrder = await adapter.createOrder(providerOrderData);
      providerOrders.push({
        provider,
        orderId: providerOrder.id,
        status: providerOrder.status
      });
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        providerOrderId: providerOrders[0]?.orderId // Primary provider order ID
      }
    });

    // Track purchase in Google Analytics
    await sendGAEvent({
      name: 'purchase',
      params: {
        transaction_id: orderId,
        value: order.total,
        currency: 'INR',
        items: order.items.map(item => ({
          item_id: item.productId,
          item_name: item.product.title,
          category: item.product.category,
          quantity: item.quantity,
          price: item.price
        })),
        user_id: order.userId,
        session_id: `order-${orderId}`
      }
    });

    console.log(`Order ${orderId} processed successfully`);
  } catch (error) {
    console.error(`Order processing failed for ${orderId}:`, error);
    
    // Update order status to failed
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });

    throw error;
  }
};