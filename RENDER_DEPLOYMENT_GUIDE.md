# 🚀 OJTech Backend - Render Deployment Guide

This guide walks you through deploying the OJTech Spring Boot backend on Render.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] Render account created ([render.com](https://render.com))
- [ ] GitHub repository with your code
- [ ] All required API keys and credentials ready (see `RENDER_ENV_VARIABLES.md`)

---

## 🗄️ Step 1: Create PostgreSQL Database

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)

2. **Create New PostgreSQL Database**
   - Click **"New"** → **"PostgreSQL"**
   - Fill in the details:
     - **Name**: `ojtech-db` (or your preferred name)
     - **Database**: `ojtech_db`
     - **User**: Will be auto-generated
     - **Region**: Choose closest to your users
     - **PostgreSQL Version**: 15 or latest
     - **Instance Type**: Free or paid (based on your needs)

3. **Wait for Database Creation**
   - Database will take 1-2 minutes to provision

4. **Copy Database Credentials**
   - Go to your database dashboard
   - Copy the **External Database URL**
   - Format: `postgres://user:password@host:port/database`
   - Convert to JDBC format: `jdbc:postgresql://host:port/database`

**Example:**
```
Render URL: postgres://user:pass@dpg-xxxxx.oregon-postgres.render.com:5432/ojtech_db
JDBC URL:   jdbc:postgresql://dpg-xxxxx.oregon-postgres.render.com:5432/ojtech_db
```

---

## 🌐 Step 2: Create Web Service

1. **Create New Web Service**
   - Click **"New"** → **"Web Service"**

2. **Connect GitHub Repository**
   - Select your GitHub account
   - Choose the repository: `ojtech-rewritten`
   - Click **"Connect"**

3. **Configure Web Service**
   
   **Basic Settings:**
   - **Name**: `ojtech-backend` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `JavaSpringBootOAuth2JwtCrud`
   - **Runtime**: `Docker`
   
   **Build Settings:**
   - **Build Command**: (Leave empty - Docker handles this)
   - **Start Command**: (Leave empty - Docker handles this)
   
   **Instance Type:**
   - Free tier or paid based on your needs
   
4. **Click "Advanced"** to add environment variables

---

## ⚙️ Step 3: Configure Environment Variables

In the **Environment Variables** section, add all required variables.

### Quick Setup: Essential Variables

**Database:**
```
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/ojtech_db
SPRING_DATASOURCE_USERNAME=your-db-user
SPRING_DATASOURCE_PASSWORD=your-db-password
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

**JWT (Generate a secure secret!):**
```
APP_JWT_SECRET=YourSuperSecure256BitRandomSecretKey
APP_JWT_EXPIRATION=86400000
```

**Cloudinary:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**OAuth2 - Google:**
```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your-client-id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your-secret
```

**OAuth2 - GitHub:**
```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID=your-client-id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET=your-secret
```

**Email:**
```
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

**Application URLs (Update after deployment):**
```
APP_BASE_URL=https://your-frontend-url.com
BACKEND_BASE_URL=https://ojtech-backend.onrender.com
```

**Other Required:**
```
GEMINI_API_KEY=your-gemini-api-key
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
```

📝 **Full list available in:** `RENDER_ENV_VARIABLES.md`

---

## 🚀 Step 4: Deploy

1. **Click "Create Web Service"**
2. Render will start building your Docker image
3. Build takes 5-10 minutes on first deployment
4. Monitor build logs for any errors

---

## 🏃 Step 5: Run Database Migrations

After deployment, you need to run Flyway migrations:

### Option A: Using Render Shell (Recommended)

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run migration check:
```bash
java -cp app.jar org.springframework.boot.loader.JarLauncher --spring.flyway.validate-on-migrate=false
```

### Option B: Temporary Enable Auto-Migration

1. Add environment variable temporarily:
```
SPRING_FLYWAY_ENABLED=true
```
2. Redeploy service
3. Remove after first successful deployment

---

## ✅ Step 6: Verify Deployment

### Check Application Health

1. **Visit Health Endpoint:**
   ```
   https://your-backend-url.onrender.com/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Check API Docs:**
   ```
   https://your-backend-url.onrender.com/swagger-ui.html
   ```

3. **Test Basic Endpoint:**
   ```
   https://your-backend-url.onrender.com/api/auth/health
   ```

### Check Logs

1. Go to **Logs** tab in Render dashboard
2. Look for:
   - ✅ "Started Application in X seconds"
   - ✅ "Tomcat started on port"
   - ❌ Any error messages

---

## 🔄 Step 7: Update OAuth2 Redirect URIs

Now that you have your backend URL, update redirect URIs:

### Google OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs:**
   ```
   https://your-backend-url.onrender.com/login/oauth2/code/google
   ```

### GitHub OAuth2
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update **Authorization callback URL:**
   ```
   https://your-backend-url.onrender.com/auth/github/callback
   ```

---

## 🔧 Step 8: Update Frontend Configuration

Update your frontend to point to the new backend URL:

**In your frontend `.env` or config:**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 📊 Monitoring & Maintenance

### View Logs
- Go to your web service → **Logs** tab
- Real-time logs available
- Download logs for analysis

### Monitor Performance
- **Metrics** tab shows:
  - CPU usage
  - Memory usage
  - Request rates
  - Response times

### Auto-Deploy on Push
- Render automatically deploys when you push to your branch
- Can be disabled in Settings if needed

---

## 🐛 Troubleshooting

### Issue: Build Fails
**Check:**
- Dockerfile syntax is correct
- All required files are in repository
- Build logs for specific error

**Solution:** Review build logs and fix errors

---

### Issue: Application Starts but Crashes
**Check:**
- Database connection (SPRING_DATASOURCE_URL correct?)
- All required environment variables set
- Logs for stack traces

**Solution:**
```bash
# Check database connectivity
psql <your-database-url>

# Verify environment variables in Render dashboard
```

---

### Issue: 502 Bad Gateway
**Check:**
- Application is listening on PORT provided by Render
- Health endpoint responding
- Startup time (might need to increase)

**Solution:**
- Verify Dockerfile uses `${PORT}` environment variable
- Check logs for startup errors

---

### Issue: OAuth2 Not Working
**Check:**
- Redirect URIs match in Google/GitHub console
- Client IDs and secrets are correct
- Backend URL is correct in APP_BASE_URL

**Solution:**
- Double-check all OAuth2 credentials
- Test with a simple request

---

### Issue: Database Connection Fails
**Check:**
- Database URL format is correct (JDBC format)
- Database is running and accessible
- Credentials are correct

**Solution:**
```bash
# Test database connection from shell
psql $DATABASE_URL

# Check if migrations ran
SELECT * FROM flyway_schema_history;
```

---

## 💰 Pricing Considerations

### Free Tier Limits
- **Web Service:** 750 hours/month
- **PostgreSQL:** 1 GB storage, 97 hours/month
- Spins down after 15 minutes of inactivity
- Cold start can take 30+ seconds

### Paid Tier Benefits
- No spin down
- Better performance
- More resources
- 24/7 availability

---

## 🔒 Security Best Practices

1. ✅ Use strong, unique passwords
2. ✅ Never commit secrets to Git
3. ✅ Use environment variables for all sensitive data
4. ✅ Enable HTTPS only (Render provides this)
5. ✅ Regularly rotate secrets
6. ✅ Monitor logs for suspicious activity
7. ✅ Keep dependencies updated

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Spring Boot on Render](https://render.com/docs/deploy-spring-boot)
- [Docker on Render](https://render.com/docs/docker)

---

## 🎉 Deployment Checklist

- [ ] PostgreSQL database created
- [ ] All environment variables configured
- [ ] Web service created and deployed
- [ ] Database migrations ran successfully
- [ ] Health endpoint returning 200 OK
- [ ] OAuth2 redirect URIs updated
- [ ] Frontend pointing to backend URL
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test email sending
- [ ] Monitor logs for errors

---

## 📞 Need Help?

- Check Render community forums
- Review application logs
- Test locally with same environment variables
- Refer to `RENDER_ENV_VARIABLES.md` for configuration details

---

**🎊 Congratulations! Your OJTech backend is now live on Render!**
