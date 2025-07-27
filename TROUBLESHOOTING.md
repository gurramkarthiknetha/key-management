# VNR Key Management - Troubleshooting Guide

## Issue: "Already Signed In" but Cannot Access Dashboard

### Symptoms
- User sees "Already Signed In!" message
- "Go to Dashboard" button doesn't work
- User is stuck on the login/home page
- Dashboard navigation fails

### Root Causes & Solutions

#### 1. Missing User Role Assignment

**Problem**: User is authenticated but doesn't have a role assigned.

**Solution**:
1. Check the debug information on the login page (shows email, role, department)
2. If role shows "Not assigned", click "Assign Role Automatically"
3. If that fails, contact admin to manually assign role

**Manual Role Assignment** (for admins):
```bash
# In the project directory
node scripts/set-user-role.js <email> <role>
# Example: node scripts/set-user-role.js user@vnrvjiet.in faculty
```

#### 2. Session/Token Issues

**Problem**: Session data is corrupted or incomplete.

**Solution**:
1. Click "Refresh Session" button on login page
2. Clear browser cookies and localStorage
3. Sign out completely and sign in again

#### 3. Environment Variables Missing

**Problem**: Required environment variables not set in Vercel.

**Check these variables in Vercel dashboard**:
- `NEXTAUTH_URL` (should be your deployment URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGODB_URI`

#### 4. Database Connection Issues

**Problem**: Cannot connect to MongoDB or user data is missing.

**Solution**:
1. Check MongoDB connection in Vercel logs
2. Verify MongoDB URI is correct
3. Ensure database has proper user collection

### Quick Fixes

#### For Users:
1. **Try the "Assign Role Automatically" button** on the login page
2. **Refresh the page** and try again
3. **Clear browser cache** and cookies
4. **Try in incognito/private mode**

#### For Developers:
1. **Check Vercel logs** for errors
2. **Verify environment variables** are set
3. **Test API endpoints** manually
4. **Check database connectivity**

### Debug Tools

#### 1. User Debug Information
Visit `/api/debug/user-info` while logged in to see session details.

#### 2. Role Assignment API
POST to `/api/fix/assign-role` to auto-assign role based on email.

#### 3. Console Logs
Check browser console for navigation errors and authentication issues.

### Common Error Messages

#### "No role assigned to your account"
- **Cause**: User exists but has no role
- **Fix**: Use role assignment button or contact admin

#### "Authentication failed"
- **Cause**: OAuth configuration issue
- **Fix**: Check Google OAuth settings and environment variables

#### "Internal server error"
- **Cause**: Database or server configuration issue
- **Fix**: Check Vercel logs and database connection

### Prevention

1. **Proper Role Assignment**: Ensure all users get roles during registration
2. **Environment Variables**: Double-check all required variables are set
3. **Database Monitoring**: Monitor MongoDB connection and user data
4. **Error Handling**: Implement proper error boundaries and fallbacks

### Contact Support

If issues persist:
1. Check the debug information on login page
2. Note any console errors
3. Contact system administrator with:
   - Your email address
   - Error messages seen
   - Steps you've already tried

### Development Testing

To test locally:
```bash
# Check deployment
node scripts/debug-deployment.js

# Test user session
node scripts/debug-user-session.js

# Assign role manually
node scripts/set-user-role.js <email> <role>
```
