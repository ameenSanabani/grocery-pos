# Global Store Architecture

This document explains the new centralized state management system using Zustand stores.

## Overview

The application now uses a centralized store architecture to eliminate scattered API calls and provide a single source of truth for all application state.

## Available Stores

### 1. useGlobalStore
Manages global application data:
- `storeProfile` - Store settings and configuration
- Loading states and error handling
- Methods: `fetchStoreProfile()`, `updateStoreProfile()`

### 2. useAuthStore
Handles authentication and user sessions:
- `user`, `token`, `isAuthenticated`
- Methods: `login()`, `logout()`, `changePassword()`

### 3. useShiftStore
Manages POS shift operations:
- `currentShift`, `registers`
- Methods: `openShift()`, `closeShift()`, `fetchActiveShift()`

### 4. useProductStore
Product inventory management:
- `products`, `searchQuery`, `selectedCategory`
- Methods: `fetchProducts()`, `createProduct()`, `updateProduct()`, `deleteProduct()`

### 5. useCustomerStore
Customer management:
- `customers`, `searchQuery`
- Methods: `fetchCustomers()`, `createCustomer()`, `updateCustomer()`, `getCustomerHistory()`

### 6. useSupplierStore
Supplier management:
- `suppliers`, `searchQuery`
- Methods: `fetchSuppliers()`, `createSupplier()`, `updateSupplier()`, `deleteSupplier()`

### 7. useCategoryStore
Product categories (existing):
- `categories`
- Methods: `fetchCategories()`

### 8. useAnalyticsStore
Business analytics and reporting:
- `summary`, `trends`, `topProducts`, `agingDebt`
- Methods: `fetchAnalytics()`, individual fetch methods

### 9. useCartStore
Shopping cart functionality (existing):
- Cart items, totals, checkout logic

## Usage Examples

### Basic Usage

```typescript
import { useProductStore, useGlobalStore } from '@/store';

function MyComponent() {
    const { products, loading, fetchProducts } = useProductStore();
    const { storeProfile } = useGlobalStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Component logic...
}
```

### Advanced Usage with Search

```typescript
function ProductSearch() {
    const { 
        products, 
        loading, 
        searchQuery, 
        setSearchQuery, 
        fetchProducts 
    } = useProductStore();

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        fetchProducts({ search: query });
    };

    // Component JSX...
}
```

## Migration Benefits

1. **Single Source of Truth**: All data comes from centralized stores
2. **Automatic Caching**: Stores maintain state and prevent redundant API calls
3. **Error Handling**: Centralized error states and retry logic
4. **Loading States**: Consistent loading indicators across the app
5. **Persistence**: Authentication and store profile data persisted in localStorage
6. **Type Safety**: Full TypeScript support for all store interfaces

## Store Provider

The `StoreProvider` component wraps the entire application and initializes essential data when the user is authenticated:

```typescript
// app/layout.tsx
import { StoreProvider } from "@/store";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

## Migration Strategy

To migrate existing components:

1. Remove direct `api` calls and local state
2. Import the appropriate store hooks
3. Use store state and methods instead
4. Remove localStorage access (handled by stores)
5. Update error handling to use store error states

## Error Handling

Each store provides:
- `error` state for error messages
- `loading` state for loading indicators
- `clearError()` method to reset errors
- Automatic error boundaries in store methods

## Performance Optimizations

- Automatic deduplication of API calls
- Selective re-renders using Zustand selectors
- Cached data with manual refresh capabilities
- Optimistic updates where appropriate

## Next Steps

1. Continue migrating remaining components to use stores
2. Implement real-time updates with WebSocket integration
3. Add offline support with service workers
4. Implement data synchronization strategies