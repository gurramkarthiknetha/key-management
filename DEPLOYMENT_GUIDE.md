# VNR Key Management System - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- SMTP email service credentials
- Google OAuth credentials
- SSL certificate for HTTPS

### Environment Configuration

Create `.env.local` with production values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/vnr-key-management
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/vnr-key-management

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Error Tracking
SENTRY_DSN=your-sentry-dsn
```

### Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "vnr-key-management" -- start
pm2 save
pm2 startup
```

### Database Setup

The application will automatically create the necessary collections and indexes on first run. For production, consider:

```javascript
// Optional: Create indexes manually for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.keys.createIndex({ department: 1, isActive: 1 })
db.keyassignments.createIndex({ facultyId: 1, status: 1 })
db.keytransactions.createIndex({ timestamp: -1 })
```

### Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📱 Mobile App Features

### PWA Installation
Users can install the app on their mobile devices:
1. Visit the website on mobile browser
2. Tap "Add to Home Screen" or install prompt
3. App will behave like a native mobile app

### Offline Support
The app includes basic offline support:
- Cached pages work offline
- Service worker handles offline states
- Data syncs when connection restored

## 🔧 System Administration

### Initial Setup
1. **Create Admin User**: First user with `@vnrvjiet.in` email becomes admin
2. **Configure Departments**: Set up department structure
3. **Add Security Staff**: Create security personnel accounts
4. **Import Keys**: Add laboratory keys to the system

### User Management
- **Faculty**: Auto-registered via Google OAuth
- **Security**: Manually created by admin
- **HOD**: Assigned by admin based on department
- **Security Head**: Manually assigned admin role

### Key Management
- **Add Keys**: Register laboratory keys with QR codes
- **Assign Access**: Grant faculty access to specific keys
- **Monitor Usage**: Track key usage patterns
- **Handle Overdue**: Automated reminders and manual interventions

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Usage Statistics**: Key usage patterns by department
- **Faculty Activity**: Individual faculty key usage
- **Security Logs**: All key transactions logged
- **Overdue Tracking**: Automated overdue key monitoring

### Performance Monitoring
```javascript
// Add to your monitoring service
const performanceMetrics = {
  apiResponseTime: 'Monitor API response times',
  databaseQueries: 'Track slow database queries',
  userSessions: 'Monitor active user sessions',
  errorRates: 'Track application errors'
};
```

## 🔒 Security Considerations

### Data Protection
- **Encryption**: All sensitive data encrypted in transit and at rest
- **Authentication**: Secure OAuth 2.0 with Google
- **Authorization**: Role-based access control
- **Session Management**: Secure session handling with NextAuth

### QR Code Security
- **Time-limited**: QR codes expire after 10 minutes
- **Single-use**: QR codes invalidated after use
- **Encrypted Data**: QR code data is encrypted
- **Audit Trail**: All QR code usage logged

### Email Security
- **SMTP TLS**: Encrypted email transmission
- **Rate Limiting**: Prevent email spam
- **Template Validation**: Secure email templates
- **Bounce Handling**: Handle failed email deliveries

## 🚨 Troubleshooting

### Common Issues

#### Authentication Problems
```bash
# Check Google OAuth configuration
# Verify NEXTAUTH_URL matches domain
# Ensure NEXTAUTH_SECRET is set
# Clear browser cookies and try again
```

#### Database Connection Issues
```bash
# Check MongoDB connection string
# Verify database server is running
# Check network connectivity
# Review MongoDB logs
```

#### Email Delivery Problems
```bash
# Verify SMTP credentials
# Check firewall settings for port 587
# Test with different email provider
# Review email service logs
```

#### Mobile App Issues
```bash
# Clear browser cache
# Check PWA manifest file
# Verify service worker registration
# Test on different mobile browsers
```

### Performance Optimization

#### Database Optimization
```javascript
// Recommended indexes for production
db.keyassignments.createIndex({ "dueDate": 1, "status": 1 })
db.keytransactions.createIndex({ "timestamp": -1, "type": 1 })
db.users.createIndex({ "role": 1, "department": 1 })
```

#### Caching Strategy
```javascript
// Implement Redis caching for frequently accessed data
const cacheConfig = {
  userSessions: '1 hour',
  keyStatuses: '5 minutes',
  departmentStats: '15 minutes',
  notifications: '2 minutes'
};
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Distribute traffic across multiple instances
- **Database Clustering**: MongoDB replica sets for high availability
- **CDN**: Serve static assets from CDN
- **Microservices**: Split into smaller services as needed

### Vertical Scaling
- **Server Resources**: Increase CPU and RAM as needed
- **Database Performance**: Optimize queries and indexes
- **Connection Pooling**: Manage database connections efficiently
- **Caching**: Implement Redis for session and data caching

## 🔄 Backup & Recovery

### Database Backup
```bash
# Daily automated backups
mongodump --uri="mongodb://localhost:27017/vnr-key-management" --out=/backup/$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/vnr-key-management" /backup/20240125
```

### Application Backup
```bash
# Backup application files
tar -czf vnr-key-management-$(date +%Y%m%d).tar.gz /path/to/application

# Backup environment configuration
cp .env.local .env.backup.$(date +%Y%m%d)
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Database Cleanup**: Remove old transaction logs
- **User Account Review**: Deactivate unused accounts
- **Key Status Audit**: Review key assignments and status
- **Security Updates**: Keep dependencies updated

### Support Contacts
- **Technical Issues**: IT Department
- **User Training**: Security Office
- **System Administration**: Key Management Team
- **Emergency Access**: Security Head

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Google OAuth working
- [ ] Email service configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Application built and deployed
- [ ] Initial admin user created
- [ ] Security staff accounts created
- [ ] Laboratory keys imported
- [ ] Mobile PWA installation tested
- [ ] Backup procedures implemented
- [ ] Monitoring systems active

**Status**: 🚀 Ready for Production Use
