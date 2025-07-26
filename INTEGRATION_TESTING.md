# VNR Key Management System - Integration Testing Guide

## 🚀 Quick Start Testing

### Prerequisites
1. **Environment Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env.local
   # Configure MongoDB, NextAuth, and SMTP settings
   
   # Run development server
   npm run dev
   ```

2. **Database Setup**
   - Ensure MongoDB is running
   - Database models will auto-create on first use
   - Seed data can be added via `/demo` page

### Testing Checklist

## ✅ Authentication & Authorization

### Google OAuth Integration
- [ ] **Login Flow**: Visit `/login` and test Google OAuth
- [ ] **Role Assignment**: Verify roles are assigned based on email domain
- [ ] **Session Persistence**: Check if sessions persist across browser refreshes
- [ ] **Logout**: Test logout functionality from all dashboards

### Role-Based Access Control
- [ ] **Faculty Access**: Can only access `/faculty` routes
- [ ] **Security Access**: Can only access `/security` routes  
- [ ] **HOD Access**: Can access `/hod` routes and department data
- [ ] **Security Head Access**: Can access `/securityincharge` and all system data
- [ ] **Route Protection**: Unauthorized users redirected appropriately

## ✅ Faculty Dashboard (`/faculty`)

### Core Functionality
- [ ] **Dashboard Loading**: Page loads without errors, shows user info
- [ ] **Bottom Navigation**: All 4 tabs (Keys, Deposit, Dept Keys, History) work
- [ ] **Theme Toggle**: Light/dark mode toggle functions correctly
- [ ] **Notifications**: Notification drawer opens and displays alerts

### Keys Tab
- [ ] **My Keys Display**: Shows assigned keys with correct status
- [ ] **QR Code Generation**: Click "View QR" generates valid QR code
- [ ] **QR Code Expiry**: QR codes expire after 10 minutes
- [ ] **Key Sharing**: Share modal opens and allows faculty selection
- [ ] **Share Duration**: Can set custom sharing duration

### API Integration
- [ ] **GET /api/keys?type=my-keys**: Returns user's assigned keys
- [ ] **POST /api/keys (generate-qr)**: Creates QR code data
- [ ] **POST /api/keys/share**: Creates sharing records
- [ ] **GET /api/keys/history**: Returns transaction history

## ✅ Security Dashboard (`/security`)

### Core Functionality
- [ ] **Dashboard Loading**: Loads with security-specific UI
- [ ] **QR Scanner**: Scanner interface appears (camera permission)
- [ ] **Pending Handovers**: Shows overdue and pending keys
- [ ] **Today's Logs**: Displays today's transactions

### QR Scanning
- [ ] **QR Code Recognition**: Can scan faculty-generated QR codes
- [ ] **Collection Process**: Successfully processes key collection
- [ ] **Deposit Process**: Successfully processes key returns
- [ ] **Expired QR Handling**: Rejects expired QR codes appropriately

### API Integration
- [ ] **POST /api/security/scan**: Processes QR scan data
- [ ] **GET /api/security/pending**: Returns pending handovers
- [ ] **POST /api/security/pending (send-reminder)**: Sends email reminders

## ✅ HOD Dashboard (`/hod`)

### Core Functionality
- [ ] **Analytics Display**: Shows department statistics correctly
- [ ] **Faculty Management**: Lists department faculty with key assignments
- [ ] **Usage Patterns**: Displays key usage analytics
- [ ] **Report Generation**: Can generate department reports

### Faculty Access Control
- [ ] **Key Assignment**: Can assign keys to faculty members
- [ ] **Access Revocation**: Can revoke key access
- [ ] **Deadline Extension**: Can extend key return deadlines
- [ ] **Bulk Actions**: Can perform bulk operations on multiple faculty

### API Integration
- [ ] **GET /api/hod/analytics**: Returns department analytics
- [ ] **GET /api/hod/faculty**: Returns faculty list with assignments
- [ ] **POST /api/hod/faculty**: Processes faculty management actions

## ✅ Security Head Dashboard (`/securityincharge`)

### Core Functionality
- [ ] **System Overview**: Shows system-wide statistics
- [ ] **User Management**: Can view and manage all users
- [ ] **Key Management**: Can manage all keys in system
- [ ] **Comprehensive Reports**: Access to all system reports

### Administrative Functions
- [ ] **User Creation**: Can create new users with roles
- [ ] **User Status Toggle**: Can activate/deactivate users
- [ ] **Key Status Management**: Can change key status (maintenance, lost)
- [ ] **Force Key Return**: Can force return overdue keys

### API Integration
- [ ] **GET /api/admin/users**: Returns all system users
- [ ] **POST /api/admin/users**: Manages user operations
- [ ] **GET /api/admin/keys**: Returns all system keys
- [ ] **POST /api/admin/keys**: Manages key operations

## ✅ Mobile Responsiveness

### Device Testing
- [ ] **iPhone (375px)**: All interfaces work on small screens
- [ ] **Android (360px)**: Touch targets are appropriately sized
- [ ] **iPad (768px)**: Tablet layout displays correctly
- [ ] **Desktop (1024px+)**: Responsive design scales properly

### Touch Interactions
- [ ] **Bottom Navigation**: Easy thumb navigation
- [ ] **Button Sizes**: Minimum 44px touch targets
- [ ] **Swipe Gestures**: Drawer swipe interactions work
- [ ] **Pull to Refresh**: Refresh functionality on mobile

### PWA Features
- [ ] **Install Prompt**: Can install as PWA on mobile
- [ ] **Offline Handling**: Graceful offline state handling
- [ ] **App Icons**: Proper icons display when installed
- [ ] **Splash Screen**: Loading screen appears correctly

## ✅ Notification System

### Real-time Notifications
- [ ] **Cross-role Alerts**: Notifications appear for relevant roles
- [ ] **Badge Counts**: Unread counts display correctly
- [ ] **Mark as Read**: Individual and bulk mark as read
- [ ] **Notification Drawer**: Smooth drawer animations

### Email Integration
- [ ] **SMTP Configuration**: Email service configured correctly
- [ ] **Overdue Reminders**: Automated overdue emails sent
- [ ] **Key Assignment Emails**: Assignment notifications sent
- [ ] **Report Emails**: Scheduled reports delivered

## ✅ Theme System

### Light/Dark Mode
- [ ] **Theme Toggle**: Switch between light and dark modes
- [ ] **System Preference**: Respects OS theme preference
- [ ] **Persistence**: Theme choice persists across sessions
- [ ] **Role Colors**: Role-specific colors work in both themes

### Visual Consistency
- [ ] **Color Contrast**: WCAG AA compliance in both themes
- [ ] **Component Theming**: All components respect theme
- [ ] **Smooth Transitions**: Theme switching is smooth
- [ ] **Icon Consistency**: Icons display correctly in both themes

## 🐛 Common Issues & Solutions

### Authentication Issues
```bash
# Clear NextAuth cookies if login fails
# Check NEXTAUTH_URL and NEXTAUTH_SECRET in .env.local
# Verify Google OAuth credentials
```

### Database Connection
```bash
# Check MongoDB connection string
# Ensure database is running
# Verify network connectivity
```

### Email Notifications
```bash
# Check SMTP credentials in .env.local
# Test with Gmail app passwords
# Verify firewall settings for SMTP ports
```

### Mobile Issues
```bash
# Test on actual devices, not just browser dev tools
# Check for iOS Safari specific issues
# Verify touch event handling
```

## 📱 Testing URLs

### Role-Specific Dashboards
- **Faculty**: `http://localhost:3000/faculty`
- **Security**: `http://localhost:3000/security`
- **HOD**: `http://localhost:3000/hod`
- **Security Head**: `http://localhost:3000/securityincharge`

### Demo & Testing
- **Component Demo**: `http://localhost:3000/demo`
- **Login Page**: `http://localhost:3000/login`

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Test key retrieval
curl -X GET "http://localhost:3000/api/keys?type=my-keys" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Test QR generation
curl -X POST "http://localhost:3000/api/keys" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"action":"generate-qr","keyId":"KEY_ID","data":{"action":"collection"}}'
```

## 🎯 Performance Testing

### Load Testing
- [ ] **Concurrent Users**: Test with multiple simultaneous users
- [ ] **Database Queries**: Monitor query performance
- [ ] **API Response Times**: Ensure sub-200ms response times
- [ ] **Memory Usage**: Check for memory leaks

### Mobile Performance
- [ ] **Bundle Size**: Optimize JavaScript bundle size
- [ ] **Image Optimization**: Ensure images are properly optimized
- [ ] **Lazy Loading**: Components load efficiently
- [ ] **Network Efficiency**: Minimize API calls

## ✅ Final Integration Checklist

- [ ] All role-based dashboards load correctly
- [ ] Authentication and authorization work properly
- [ ] QR code generation and scanning function
- [ ] Email notifications are sent successfully
- [ ] Mobile responsiveness is optimal
- [ ] Theme system works across all components
- [ ] Database operations complete successfully
- [ ] API endpoints return expected data
- [ ] Error handling is graceful
- [ ] Performance is acceptable on mobile devices

## 🚀 Deployment Readiness

Once all tests pass:
1. **Environment Variables**: Set production environment variables
2. **Database Migration**: Ensure production database is set up
3. **SMTP Configuration**: Configure production email service
4. **Domain Setup**: Update NEXTAUTH_URL for production domain
5. **SSL Certificate**: Ensure HTTPS is properly configured
6. **Monitoring**: Set up error tracking and performance monitoring

---

**Status**: ✅ Ready for Production Deployment
