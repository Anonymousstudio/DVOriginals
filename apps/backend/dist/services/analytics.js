"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackProductView = exports.trackPageView = exports.trackPurchase = exports.sendGAEvent = void 0;
const sendGAEvent = async (event) => {
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
    }
    catch (error) {
        console.error('Failed to send GA event:', error);
    }
};
exports.sendGAEvent = sendGAEvent;
const trackPurchase = async (data) => {
    await (0, exports.sendGAEvent)({
        name: 'purchase',
        params: data
    });
};
exports.trackPurchase = trackPurchase;
const trackPageView = async (data) => {
    await (0, exports.sendGAEvent)({
        name: 'page_view',
        params: data
    });
};
exports.trackPageView = trackPageView;
const trackProductView = async (data) => {
    await (0, exports.sendGAEvent)({
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
exports.trackProductView = trackProductView;
