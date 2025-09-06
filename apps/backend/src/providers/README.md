# Provider Integration Guide

This directory contains adapters for integrating with Print-on-Demand providers. Each provider has its own adapter file with standardized interfaces.

## Current Status

All provider adapters are currently implemented with mock data and placeholder functions. To enable real provider integration, follow the steps below for each provider.

## Printrove Integration

### API Documentation Needed
Please add Printrove API documentation to `printrove.ts`. Required information:
- Base API URL
- Authentication method (API key, Bearer token, etc.)
- Product listing endpoint
- Single product endpoint
- Order creation endpoint
- Order status endpoint
- Webhook configuration and signature verification

### Implementation Steps
1. Replace mock responses in `printroveAdapter` methods
2. Add proper authentication headers
3. Implement error handling
4. Add webhook signature verification
5. Map Printrove response format to normalized format

## Printful Integration

### API Documentation
Printful API documentation is available at: https://developers.printful.com/docs/

### Implementation Steps
1. Uncomment and modify the API calls in `printfulAdapter`
2. Add proper error handling and response mapping
3. Implement webhook signature verification
4. Test with Printful sandbox environment

## Printify Integration

### API Documentation
Printify API documentation is available at: https://developers.printify.com/

### Implementation Steps
1. Uncomment and modify the API calls in `printifyAdapter`
2. Add shop ID configuration
3. Implement proper error handling
4. Add webhook signature verification
5. Test with Printify test environment

## Adding New Providers

To add a new provider:

1. Create a new file `newprovider.ts` in this directory
2. Implement the `ProviderAdapter` interface
3. Add the provider to the `providers` object in `index.ts`
4. Add the provider enum value to the shared types
5. Update the database schema to include the new provider
6. Update the admin dashboard to support the new provider

## Testing

Each provider adapter should include:
- Unit tests for all methods
- Mock responses for development
- Integration tests with real API endpoints (using test credentials)
- Webhook verification tests

## Common Implementation Patterns

### Error Handling
```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Provider API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error('Provider API call failed:', error);
  throw new Error('Failed to communicate with provider');
}
```

### Rate Limiting
Consider implementing rate limiting for provider API calls to avoid hitting API limits.

### Caching
Implement caching for frequently accessed data like product catalogs to reduce API calls.