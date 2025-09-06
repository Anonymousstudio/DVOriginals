"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentLink = exports.captureRazorpayPayment = exports.verifyRazorpayPayment = exports.createRazorpayOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const createRazorpayOrder = async (options) => {
    try {
        const order = await razorpay.orders.create({
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            notes: options.notes,
            payment_capture: 1
        });
        return order;
    }
    catch (error) {
        console.error('Razorpay order creation failed:', error);
        throw new Error('Payment order creation failed');
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
const verifyRazorpayPayment = async (paymentId, orderId, signature) => {
    try {
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
        return expectedSignature === signature;
    }
    catch (error) {
        console.error('Razorpay payment verification failed:', error);
        return false;
    }
};
exports.verifyRazorpayPayment = verifyRazorpayPayment;
const captureRazorpayPayment = async (paymentId, amount) => {
    try {
        const payment = await razorpay.payments.capture(paymentId, amount);
        return payment;
    }
    catch (error) {
        console.error('Razorpay payment capture failed:', error);
        throw new Error('Payment capture failed');
    }
};
exports.captureRazorpayPayment = captureRazorpayPayment;
const createPaymentLink = async (options) => {
    try {
        const paymentLink = await razorpay.paymentLink.create(options);
        return paymentLink;
    }
    catch (error) {
        console.error('Payment link creation failed:', error);
        throw new Error('Payment link creation failed');
    }
};
exports.createPaymentLink = createPaymentLink;
