# API Migration Guide: Next.js Routes → Express Backend

This guide explains how to migrate from Next.js API routes to the new Express.js backend server.

## 🔄 Migration Overview

### Before (Next.js API Routes)
```typescript
// Old way: Direct fetch to Next.js API routes
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### After (Express Backend)
```typescript
// New way: Using API client
import { apiClient } from '@/lib/api-client';

const response = await apiClient.login({ email, password });
```

## 📚 Available Tools

### 1. API Client (`@/lib/api-client`)
- **Purpose**: Direct communication with Express backend
- **Features**: Authentication, error handling, token management
- **Usage**: `apiClient.methodName(params)`

### 2. React Hooks (`@/hooks/useApi`)
- **Purpose**: React integration with loading states and error handling
- **Features**: Automatic loading states, error handling, data caching
- **Usage**: `const { data, loading, error } = useKeys()`

### 3. Service Layer (`@/lib/api-service`)
- **Purpose**: Organized service functions for different domains
- **Features**: Batch operations, caching, response handling
- **Usage**: `await keyService.createKey(keyData)`

## 🔧 Migration Steps

### Step 1: Replace Authentication Calls

**Old Code:**
```typescript
// components/LoginForm.tsx
const handleLogin = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  // Handle response...
};
```

**New Code:**
```typescript
// components/LoginForm.tsx
import { useAuth } from '@/hooks/useApi';

const LoginForm = () => {
  const { login, loading, error } = useAuth();
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      // Success handled automatically
    } catch (error) {
      // Error handled automatically
    }
  };
};
```

### Step 2: Replace Data Fetching

**Old Code:**
```typescript
// pages/dashboard.tsx
const [keys, setKeys] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setKeys(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchKeys();
}, []);
```

**New Code:**
```typescript
// pages/dashboard.tsx
import { useKeys } from '@/hooks/useApi';

const Dashboard = () => {
  const { data: keys, loading, error } = useKeys();
  
  // Data is automatically fetched and managed
};
```

### Step 3: Replace Mutations (Create/Update/Delete)

**Old Code:**
```typescript
// components/KeyForm.tsx
const handleCreateKey = async (keyData) => {
  setLoading(true);
  try {
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keyData)
    });
    const data = await response.json();
    if (data.success) {
      // Handle success
    }
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

**New Code:**
```typescript
// components/KeyForm.tsx
import { useCreateKey } from '@/hooks/useApi';

const KeyForm = () => {
  const createKey = useCreateKey();
  
  const handleCreateKey = async (keyData) => {
    try {
      await createKey.mutate(keyData);
      // Success handled automatically
    } catch (error) {
      // Error handled automatically
    }
  };
  
  return (
    <button 
      onClick={() => handleCreateKey(formData)}
      disabled={createKey.loading}
    >
      {createKey.loading ? 'Creating...' : 'Create Key'}
    </button>
  );
};
```

## 📋 Endpoint Mapping

### Authentication
| Old Route | New Method | Hook |
|-----------|------------|------|
| `POST /api/auth/login` | `apiClient.login()` | `useAuth().login()` |
| `POST /api/auth/register` | `apiClient.register()` | `useAuth().register()` |
| `GET /api/auth/me` | `apiClient.getCurrentUser()` | `useAuth().getCurrentUser()` |

### Keys Management
| Old Route | New Method | Hook |
|-----------|------------|------|
| `GET /api/keys` | `apiClient.getKeys()` | `useKeys()` |
| `POST /api/keys` | `apiClient.createKey()` | `useCreateKey()` |
| `PUT /api/keys/:id` | `apiClient.updateKey()` | `useUpdateKey()` |
| `DELETE /api/keys/:id` | `apiClient.deleteKey()` | `useDeleteKey()` |
| `POST /api/keys/checkout` | `apiClient.checkoutKey()` | `useCheckoutKey()` |
| `POST /api/keys/checkin` | `apiClient.checkinKey()` | `useCheckinKey()` |

### Users Management
| Old Route | New Method | Hook |
|-----------|------------|------|
| `GET /api/users` | `apiClient.getUsers()` | `useUsers()` |
| `POST /api/users` | `apiClient.createUser()` | `useCreateUser()` |
| `PUT /api/users/:id` | `apiClient.updateUser()` | `useUpdateUser()` |
| `DELETE /api/users/:id` | `apiClient.deleteUser()` | `useDeleteUser()` |

### Dashboard & Reports
| Old Route | New Method | Hook |
|-----------|------------|------|
| `GET /api/dashboard/stats` | `apiClient.getDashboardStats()` | `useDashboardStats()` |
| `GET /api/dashboard/admin` | `apiClient.getAdminDashboard()` | `useAdminDashboard()` |
| `GET /api/reports` | `apiClient.generateReport()` | `useMutation()` |

## 🎯 Best Practices

### 1. Use Hooks for Components
```typescript
// ✅ Good: Use hooks in React components
const MyComponent = () => {
  const { data, loading, error } = useKeys();
  // Component logic...
};
```

### 2. Use Service Layer for Utilities
```typescript
// ✅ Good: Use service layer in utility functions
import { keyService } from '@/lib/api-service';

const exportKeys = async () => {
  const response = await keyService.getKeys();
  // Process data...
};
```

### 3. Handle Loading States
```typescript
// ✅ Good: Always handle loading states
const { data, loading, error } = useKeys();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <KeysList keys={data} />;
```

### 4. Use Error Boundaries
```typescript
// ✅ Good: Wrap components in error boundaries
<ErrorBoundary>
  <KeyManagementComponent />
</ErrorBoundary>
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### API Client Configuration
```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

## 🧪 Testing Migration

### 1. Test API Connectivity
```typescript
import { healthService } from '@/lib/api-service';

const testConnection = async () => {
  try {
    const response = await healthService.checkHealth();
    console.log('Backend connected:', response.success);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
};
```

### 2. Test Authentication
```typescript
import { authService } from '@/lib/api-service';

const testAuth = async () => {
  try {
    const response = await authService.login('test@example.com', 'password123');
    console.log('Login successful:', response.success);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 3. Use the Example Component
```typescript
// Import and use the example component
import ApiIntegrationExample from '@/components/examples/ApiIntegrationExample';

// Add to your page to test all functionality
<ApiIntegrationExample />
```

## 🚀 Next Steps

1. **Start the Express server**: `cd server && npm run dev`
2. **Update environment variables**: Add `NEXT_PUBLIC_API_URL=http://localhost:5000`
3. **Replace one component at a time**: Start with simple data fetching
4. **Test thoroughly**: Use the example component to verify functionality
5. **Remove old API routes**: Once migration is complete

## 📞 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Express server has CORS configured for `http://localhost:3000`
2. **Authentication Errors**: Check token storage and API client token management
3. **Network Errors**: Verify Express server is running on port 5000
4. **Type Errors**: Update TypeScript interfaces to match backend responses

### Debug Tools

```typescript
// Enable debug logging
localStorage.setItem('debug', 'api:*');

// Check API client state
console.log('API Client Token:', apiClient.token);

// Test individual endpoints
await apiClient.healthCheck();
```
