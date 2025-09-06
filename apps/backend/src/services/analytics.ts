interface GAEvent {
  name: string;
  params: Record<string, any>;
}

export const sendGAEvent = async (event: GAEvent): Promise<void> => {
  try {
    const measurementId = process.env.GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA_API_SECRET;

    if (!measurementId || !apiSecret) {
      console.warn('Google Analytics not configured');
      return;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    const payload = {
      client_id: event.params.session_id || 'anonymous',
      events: [
        {
          name: event.name,
          params: {
            ...event.params,
            timestamp_micros: Date.now() * 1000
          }
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('GA event sending failed:', response.status);
    }
  } catch (error) {
    console.error('Failed to send GA event:', error);
  }
};

export const trackPurchase = async (data: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
  user_id?: string;
  session_id: string;
}) => {
  await sendGAEvent({
    name: 'purchase',
    params: data
  });
};

export const trackPageView = async (data: {
  page_title: string;
  page_location: string;
  session_id: string;
  user_id?: string;
}) => {
  await sendGAEvent({
    name: 'page_view',
    params: data
  });
};

export const trackProductView = async (data: {
  item_id: string;
  item_name: string;
  category: string;
  price: number;
  session_id: string;
  user_id?: string;
}) => {
  await sendGAEvent({
    name: 'view_item',
    params: {
      currency: 'INR',
      value: data.price,
      items: [{
        item_id: data.item_id,
        item_name: data.item_name,
        category: data.category,
        quantity: 1,
        price: data.price
      }],
      session_id: data.session_id,
      user_id: data.user_id
    }
  });
};