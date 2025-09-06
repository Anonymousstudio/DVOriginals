import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CreateOrderOptions {
  amount: number; // in paisa
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (options: CreateOrderOptions) => {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
      payment_capture: 1
    });

    return order;
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Payment order creation failed');
  }
};

export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error('Razorpay payment verification failed:', error);
    return false;
  }
};

export const captureRazorpayPayment = async (paymentId: string, amount: number) => {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount);
    return payment;
  } catch (error) {
    console.error('Razorpay payment capture failed:', error);
    throw new Error('Payment capture failed');
  }
};

export const createPaymentLink = async (options: {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  notify: {
    sms: boolean;
    email: boolean;
  };
  callback_url: string;
  callback_method: string;
}) => {
  try {
    const paymentLink = await razorpay.paymentLink.create(options);
    return paymentLink;
  } catch (error) {
    console.error('Payment link creation failed:', error);
    throw new Error('Payment link creation failed');
  }
};