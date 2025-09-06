import { ProviderType } from '@pod/shared';
import { printfulAdapter } from './printful';
import { printifyAdapter } from './printify';
import { printroveAdapter } from './printrove';

export interface ProviderAdapter {
  listProducts(): Promise<any[]>;
  getProduct(id: string): Promise<any>;
  createOrder(orderData: any): Promise<any>;
  getOrder(id: string): Promise<any>;
  listOrders(params?: any): Promise<any[]>;
  verifyWebhook(payload: any, signature?: string): boolean;
  processWebhook(payload: any): Promise<void>;
}

const providers: Record<ProviderType, ProviderAdapter> = {
  PRINTROVE: printroveAdapter,
  PRINTFUL: printfulAdapter,
  PRINTIFY: printifyAdapter
};

export const getProviderAdapter = (provider: ProviderType): ProviderAdapter => {
  return providers[provider];
};

export const processProviderWebhook = async (
  provider: ProviderType,
  payload: any,
  signature?: string
): Promise<void> => {
  const adapter = getProviderAdapter(provider);
  
  // Verify webhook signature
  if (!adapter.verifyWebhook(payload, signature)) {
    throw new Error('Invalid webhook signature');
  }

  // Process webhook
  await adapter.processWebhook(payload);
};