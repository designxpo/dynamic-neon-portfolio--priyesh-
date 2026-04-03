# Production Deployment Guide

## MongoDB Data Persistence Fix

This guide helps you fix the data reversion issues and optimize your portfolio for production.

## 🔧 Pre-Deployment Checklist

### 1. MongoDB Atlas Configuration
Verify these settings in your MongoDB Atlas dashboard:

- [ ] **Cluster Status**: Ensure your cluster is active (not paused)
- [ ] **Network Access**: Add `0.0.0.0/0` to IP Access List for hosting platforms
- [ ] **Database User**: Verify credentials are valid and have read/write permissions
- [ ] **Connection String**: Use the SRV connection string format

### 2. Environment Variables
Set these in your hosting platform (Vercel/Netlify/etc.):

```bash
# Required
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
NODE_ENV=production

# Important: Prevent automatic data overwriting
FORCE_DB_SEEDING=false

# Optional
GEMINI_API_KEY=your_gemini_key
MIGRATION_PASSWORD=your_secure_migration_password
```

## 🚀 Deployment Steps

### Step 1: Test MongoDB Connection
Before deploying, test your connection:

```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "mongodb": {
    "configured": true,
    "connected": true,
    "connectionState": "connected"
  }
}
```

### Step 2: Backup Current Data (if any)
If you have existing data in MongoDB:

```bash
curl -X POST https://yourdomain.com/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "backup", "password": "your_migration_password"}'
```

### Step 3: Deploy Application
Deploy your application using your hosting platform's standard process.

### Step 4: Verify Data Persistence
1. Visit your admin panel: `https://yourdomain.com/#/admin`
2. Make a test edit and save
3. Wait 5 minutes or restart your hosting platform
4. Check if changes persist

## 🔍 Troubleshooting

### Issue: Data Still Reverts to Default
**Causes & Solutions:**

1. **Environment Variable Not Set**
   - Check `NODE_ENV=production` is set
   - Verify `FORCE_DB_SEEDING=false`

2. **MongoDB Connection Issues**
   - Check health endpoint: `/api/health`
   - Verify IP whitelist in MongoDB Atlas
   - Test connection string manually

3. **Hosting Platform Cache**
   - Clear CDN cache (Cloudflare, Vercel Edge Cache)
   - Force rebuild and redeploy

### Issue: Slow Performance
**Solutions:**

1. **Connection Pooling** (Already implemented)
   - Max pool size: 10 connections
   - Connection reuse across requests

2. **Database Indexing**
   - MongoDB Atlas automatically creates indexes
   - Monitor performance in Atlas dashboard

3. **API Response Caching**
   - Use `cache: 'no-store'` for admin endpoints
   - Cache static data for public endpoints

## 🛠️ Recovery Tools

### Database Migration API
Use the migration API for data recovery:

```bash
# Check database status
curl -X POST https://yourdomain.com/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "status", "password": "your_password"}'

# Backup data
curl -X POST https://yourdomain.com/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "backup", "password": "your_password"}'

# Restore from backup
curl -X POST https://yourdomain.com/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "restore", "password": "your_password", "data": {...}}'
```

## 📊 Monitoring

### Key Metrics to Monitor
1. **Database Connection Status**: `/api/health`
2. **Response Times**: Admin panel load times
3. **Error Rates**: Check hosting platform logs
4. **Data Consistency**: Regular manual checks

### Setting Up Alerts
1. **MongoDB Atlas**: Set up performance alerts
2. **Hosting Platform**: Configure error alerts
3. **Uptime Monitoring**: Use services like UptimeRobot

## 🔐 Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **Migration Password**: Change default migration password
3. **MongoDB Access**: Restrict IP access in production
4. **Admin Password**: Change default admin password via UI

## 📝 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Data reverts overnight | Auto-seeding enabled | Set `FORCE_DB_SEEDING=false` |
| Slow API responses | No connection pooling | Already fixed in code |
| Connection errors | Wrong IP whitelist | Add `0.0.0.0/0` to MongoDB Atlas |
| Build failures | Missing env vars | Set all required variables |
| Cache issues | Old CDN cache | Clear hosting platform cache |

## ✅ Post-Deployment Verification

After deployment, verify:

- [ ] Health check returns healthy MongoDB status
- [ ] Admin panel loads without errors
- [ ] Data changes persist after 10+ minutes
- [ ] Site loads quickly (< 3 seconds)
- [ ] No console errors in browser
- [ ] Contact form submissions work
- [ ] Chatbot functionality works (if using Gemini)

---

**Need Help?**
If issues persist, check:
1. Hosting platform logs
2. MongoDB Atlas logs
3. Browser dev console
4. Network tab for failed requests