# VNR Key Management System - Mobile-First UI

A comprehensive, mobile-first QR-based Key Management System designed for educational institutions with role-specific dashboards and modern UI components.

## 🎯 Features

### 🎓 Faculty Dashboard
- **Bottom Navigation**: Keys, Deposit, Dept Keys, History
- **QR Code Integration**: Generate QR codes for key collection/deposit (10-minute expiry)
- **Key Management**: View assigned keys, share access with other faculty
- **Department Overview**: Check availability of department keys
- **Activity History**: Complete timeline of key usage

### 🛡️ Security Dashboard  
- **Bottom Navigation**: Scan, Pending, Today Logs
- **QR Scanner**: Real-time QR code scanning for key handovers
- **Pending Management**: Track overdue keys with email reminders
- **Activity Logs**: Daily transaction history and monitoring

### 🧑‍💼 HOD Dashboard
- **Bottom Navigation**: Usage, Access, Reports
- **Department Analytics**: Key usage patterns and statistics
- **Access Control**: Manage faculty permissions and key assignments
- **Reporting**: Generate and email department reports

### 🛡️ Security Head Dashboard
- **Bottom Navigation**: Dashboard, Users, Keys, Reports
- **System Overview**: Live monitoring of all key activities
- **User Management**: Add/edit/delete users and assign roles
- **Key Administration**: Manage all keys and access levels
- **Comprehensive Reports**: System-wide analytics and audit logs

## 🎨 Design System

### Theme Support
- **Light/Dark Mode**: Automatic system preference detection with manual toggle
- **Role-specific Colors**: Each role has distinct color schemes
  - Faculty: Blue (`#3b82f6`)
  - Security: Green (`#10b981`) 
  - HOD: Purple (`#8b5cf6`)
  - Security Head: Amber (`#f59e0b`)

### Mobile-First Components
- **Responsive Cards**: Soft rounded corners with role-specific styling
- **Bottom Navigation**: Touch-friendly with notification badges
- **Enhanced Header**: Logo, notifications, profile, and theme toggle
- **Smart Modals**: Mobile-optimized with proper safe area handling
- **Notification System**: Cross-role alerts with email integration

## 📱 Mobile Optimization

### Touch Interactions
- **44px minimum touch targets** for accessibility
- **Haptic feedback** on supported devices
- **Swipe gestures** for navigation and actions
- **Pull-to-refresh** functionality
- **Virtual keyboard handling** with viewport adjustments

### Responsive Design
- **Breakpoints**: xs(0), sm(640px), md(768px), lg(1024px), xl(1280px)
- **Safe area support** for notched devices
- **Orientation handling** with automatic layout adjustments
- **Device detection** for optimal experience

### Performance
- **Debounced interactions** to prevent excessive API calls
- **Lazy loading** for images and components
- **Optimized animations** with reduced motion support
- **Network-aware features** for slow connections

## 🔔 Notification System

### Real-time Notifications
- **Browser notifications** for high-priority alerts
- **In-app notification drawer** with filtering
- **Role-specific notifications** with proper targeting
- **Email integration** using Nodemailer for reminders

### Notification Types
- **Key Overdue**: Automatic reminders for faculty and security
- **Key Assignment**: New key access notifications
- **Security Alerts**: Urgent security-related notifications
- **System Updates**: Maintenance and system notifications
- **Reports Ready**: Automated report generation alerts

## 🛠️ Technical Implementation

### Core Technologies
- **Next.js 14** with App Router
- **React 18** with modern hooks
- **Tailwind CSS** with custom design system
- **Lucide React** for consistent iconography
- **QR Code generation** with expiry handling

### Key Components

#### Enhanced UI Components
```jsx
// Role-specific bottom navigation
<BottomNavigation
  items={navItems}
  activeItem={activeTab}
  variant="faculty" // faculty, security, hod, security-head
  onItemClick={handleNavClick}
/>

// Theme-aware cards
<Card 
  role="faculty" 
  interactive 
  className="hover:shadow-lg"
>
  Content
</Card>

// Smart notifications
<NotificationDrawer
  isOpen={showNotifications}
  notifications={notifications}
  userRole="faculty"
  onMarkAsRead={handleMarkAsRead}
/>
```

#### Responsive Hooks
```jsx
// Device detection
const { isMobile, isTablet, breakpoint } = useResponsive();

// Orientation handling
const orientation = useOrientation();

// Virtual keyboard detection
const { isOpen, keyboardHeight } = useVirtualKeyboard();

// Touch gestures
const gestures = useSwipeGesture(elementRef, {
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right')
});
```

### File Structure
```
key-management/
├── components/
│   ├── ui/                     # Enhanced UI components
│   │   ├── BottomNavigation.jsx
│   │   ├── Card.jsx
│   │   ├── NotificationDrawer.jsx
│   │   ├── ThemeProvider.jsx
│   │   └── ThemeToggle.jsx
│   ├── Faculty/                # Faculty-specific components
│   │   ├── FacultyDashboardNew.jsx
│   │   ├── QRModalNew.jsx
│   │   └── ShareModalNew.jsx
│   ├── Security/               # Security components
│   │   └── SecurityDashboardNew.jsx
│   ├── HOD/                    # HOD components
│   │   └── HODDashboardNew.jsx
│   └── SecurityIncharge/       # Security Head components
│       └── SecurityHeadDashboardNew.jsx
├── lib/
│   ├── NotificationContext.js  # Notification management
│   ├── emailService.js         # Email notifications
│   ├── themeConfig.js          # Theme configuration
│   ├── mobileUtils.js          # Mobile utilities
│   └── useResponsive.js        # Responsive hooks
└── app/
    ├── globals.css             # Enhanced theme system
    └── demo/                   # Component showcase
        └── page.jsx
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- SMTP credentials for email notifications

### Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit demo page
http://localhost:3000/demo
```

## 📱 Testing

### Device Testing
- **iOS Safari**: iPhone 12+, iPad Pro
- **Android Chrome**: Samsung Galaxy, Google Pixel
- **Desktop**: Chrome, Firefox, Safari, Edge

### Responsive Testing
```bash
# Test different viewports
- Mobile: 375x667 (iPhone SE)
- Tablet: 768x1024 (iPad)
- Desktop: 1920x1080

# Test orientations
- Portrait and landscape modes
- Safe area handling on notched devices
```

### Accessibility Testing
- **WCAG 2.1 AA compliance**
- **Screen reader compatibility**
- **Keyboard navigation support**
- **High contrast mode support**

## 🎯 Key Features Implemented

✅ **Mobile-First Design** - Optimized for touch interactions  
✅ **Role-Specific UI** - Distinct interfaces for each user type  
✅ **QR Code Integration** - Generate and scan QR codes with expiry  
✅ **Real-time Notifications** - Cross-role notification system  
✅ **Dark/Light Theme** - Automatic and manual theme switching  
✅ **Responsive Components** - Adaptive layouts for all screen sizes  
✅ **Touch Gestures** - Swipe, pull-to-refresh, and haptic feedback  
✅ **Email Notifications** - Automated reminders and reports  
✅ **Accessibility** - WCAG compliant with screen reader support  
✅ **Performance Optimized** - Debounced interactions and lazy loading  

## 📄 License

This project is part of the VNR VJIET Key Management System and is proprietary software.

---

**Demo**: Visit `/demo` to see all components and features in action across different roles and themes.
