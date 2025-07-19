# Frontend-Backend Integration Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running (or MongoDB Atlas connection)
- Both backend and frontend servers running

### Starting the Application

1. **Start Backend Server:**
   ```bash
   cd key-management-server
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start Frontend Server:**
   ```bash
   cd key-management/vnr-keys
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

## 🔐 Authentication Flow

### User Registration
1. Navigate to `/register`
2. Fill in:
   - **User ID**: Unique identifier (e.g., `faculty001`, `security001`)
   - **Password**: Minimum 6 characters
   - **Role**: Select from `faculty`, `security`, or `security-head`
3. Upon successful registration, user is automatically logged in and redirected

### User Login
1. Navigate to `/login`
2. Enter User ID and Password
3. System redirects based on role:
   - **Faculty** → `/faculty`
   - **Security** → `/security`
   - **Security Head** → `/securityincharge`

## 👥 User Roles & Permissions

### Faculty (`faculty`)
- **Access**: Faculty dashboard (`/faculty`)
- **Permissions**:
  - View assigned keys (`GET /api/keys/my`)
  - View key details and QR codes
  - Request key assignments (future feature)

### Security (`security`)
- **Access**: Security dashboard (`/security`)
- **Permissions**:
  - View all keys (`GET /api/keys`)
  - Assign keys to faculty (`PUT /api/keys/:id/assign`)
  - Mark keys as returned (`PUT /api/keys/:id/return`)
  - Scan QR codes for key operations

### Security Head (`security-head`)
- **Access**: Security head dashboard (`/securityincharge`)
- **Permissions**:
  - All security permissions
  - Create new keys (`POST /api/keys`)
  - Delete keys (`DELETE /api/keys/:id`)
  - Manage users and generate reports

## 🔧 API Integration

### Authentication Context
The app uses React Context for global authentication state:

```javascript
import { useAuth } from '../lib/useAuth';

const { user, isAuthenticated, login, logout, error } = useAuth();
```

### Key Management Hook
For key operations:

```javascript
import { useKeys } from '../lib/useAuth';

const { keys, loading, error, getAllKeys, getMyKeys, createKey, assignKey, returnKey } = useKeys();
```

### API Service Layer
Centralized API calls in `/lib/api.js`:

```javascript
import { authAPI, keyAPI } from '../lib/api';

// Authentication
await authAPI.login({ userId, password });
await authAPI.register({ userId, password, role });

// Key Management
await keyAPI.getAllKeys();
await keyAPI.getMyKeys();
await keyAPI.createKey({ keyId, location });
```

## 🛡️ Protected Routes

Routes are automatically protected based on user roles:

```javascript
import { FacultyRoute, SecurityRoute, SecurityHeadRoute } from '../components/ProtectedRoute';

// Faculty-only page
<FacultyRoute>
  <FacultyDashboard />
</FacultyRoute>

// Security and Security-Head page
<SecurityRoute>
  <SecurityDashboard />
</SecurityRoute>

// Security-Head only page
<SecurityHeadRoute>
  <SecurityHeadDashboard />
</SecurityHeadRoute>
```

## 📱 Frontend Features

### Authentication
- ✅ JWT token management with cookies
- ✅ Automatic token refresh
- ✅ Role-based redirects
- ✅ Protected route components

### Faculty Dashboard
- ✅ View assigned keys
- ✅ QR code generation for keys
- ✅ Key sharing functionality
- ✅ Real-time key status updates

### Security Dashboard
- ✅ View all keys in system
- ✅ Search and filter keys
- ✅ Assign keys to faculty
- ✅ Mark keys as returned
- ✅ Key statistics overview

### Security Head Dashboard
- ✅ All security features
- ✅ Create new keys
- ✅ Delete keys
- ✅ User management
- ✅ System reports

## 🔄 State Management

### Authentication State
- User information stored in React Context
- JWT tokens stored in HTTP-only cookies
- Automatic logout on token expiration

### Key Management State
- Real-time key data fetching
- Optimistic updates for better UX
- Error handling and retry mechanisms

## 🎨 UI Components

### Loading States
```javascript
import { LoadingSpinner, SectionLoading, PageLoading } from '../components/ui/LoadingStates';
```

### Error Handling
```javascript
import { ErrorMessage, PageError, NetworkError } from '../components/ui/LoadingStates';
```

## 🧪 Testing the Integration

### Test Users
Create test users for each role:

```bash
# Faculty user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"faculty001","password":"password123","role":"faculty"}'

# Security user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"security001","password":"password123","role":"security"}'

# Security Head user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"sechead001","password":"password123","role":"security-head"}'
```

### Test Scenarios

1. **Registration & Login Flow**
   - Register new users with different roles
   - Login with created credentials
   - Verify role-based redirects

2. **Faculty Workflow**
   - Login as faculty
   - View assigned keys
   - Generate QR codes

3. **Security Workflow**
   - Login as security
   - View all keys
   - Assign keys to faculty
   - Mark keys as returned

4. **Security Head Workflow**
   - Login as security head
   - Create new keys
   - Manage existing keys
   - Delete keys

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🚨 Error Handling

### Common Issues

1. **CORS Errors**
   - Backend includes CORS middleware
   - Frontend configured for localhost:5000

2. **Authentication Errors**
   - JWT tokens automatically managed
   - Automatic redirect to login on 401

3. **Network Errors**
   - Retry mechanisms built-in
   - User-friendly error messages

## 📈 Performance Optimizations

- JWT tokens cached in cookies
- API responses cached where appropriate
- Optimistic updates for better UX
- Loading states for all async operations

## 🔮 Future Enhancements

- Real-time notifications with WebSockets
- QR code scanning functionality
- Advanced reporting and analytics
- Mobile app integration
- Audit logging and compliance features
