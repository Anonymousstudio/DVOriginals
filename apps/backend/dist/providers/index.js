"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processProviderWebhook = exports.getProviderAdapter = void 0;
const printful_1 = require("./printful");
const printify_1 = require("./printify");
const printrove_1 = require("./printrove");
const providers = {
    PRINTROVE: printrove_1.printroveAdapter,
    PRINTFUL: printful_1.printfulAdapter,
    PRINTIFY: printify_1.printifyAdapter
};
const getProviderAdapter = (provider) => {
    return providers[provider];
};
exports.getProviderAdapter = getProviderAdapter;
const processProviderWebhook = async (provider, payload, signature) => {
    const adapter = (0, exports.getProviderAdapter)(provider);
    // Verify webhook signature
    if (!adapter.verifyWebhook(payload, signature)) {
        throw new Error('Invalid webhook signature');
    }
    // Process webhook
    await adapter.processWebhook(payload);
};
exports.processProviderWebhook = processProviderWebhook;
