# 🚀 Render Deployment - Quick Reference

## 📋 Quick Setup Commands

### 1️⃣ Database URL Format
```bash
# Render PostgreSQL URL
postgres://user:password@host:port/database

# Convert to JDBC (Spring Boot format)
jdbc:postgresql://host:port/database
```

### 2️⃣ Minimum Required Environment Variables
```bash
# Database (REQUIRED)
SPRING_DATASOURCE_URL=jdbc:postgresql://your-host:5432/dbname
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password

# JWT (REQUIRED - Generate secure secret!)
APP_JWT_SECRET=YourSecure256BitSecret

# Cloudinary (REQUIRED)
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret

# URLs (REQUIRED - Update after deploy)
APP_BASE_URL=https://frontend-url.com
BACKEND_BASE_URL=https://backend-url.onrender.com
```

---

## 🔑 Where to Get Credentials

| Service | Where to Get | Link |
|---------|--------------|------|
| **PostgreSQL** | Render Dashboard | Create New → PostgreSQL |
| **Cloudinary** | Cloudinary Dashboard | [cloudinary.com/console](https://cloudinary.com/console) |
| **Google OAuth** | Google Cloud Console | [console.cloud.google.com](https://console.cloud.google.com) |
| **GitHub OAuth** | GitHub Settings | [github.com/settings/developers](https://github.com/settings/developers) |
| **Gemini API** | Google AI Studio | [makersuite.google.com](https://makersuite.google.com/app/apikey) |
| **Gmail App Password** | Google Account Security | Enable 2FA → Generate App Password |

---

## ⚡ Quick Deployment Steps

```bash
1. Create PostgreSQL Database on Render
2. Create Web Service → Connect GitHub
3. Set Root Directory: JavaSpringBootOAuth2JwtCrud
4. Set Runtime: Docker
5. Add Environment Variables (see .env.example)
6. Deploy
7. Update OAuth Redirect URIs
8. Test Health Endpoint
```

---

## 🔍 Health Check URLs

```bash
# Application Health
https://your-backend.onrender.com/actuator/health

# API Documentation
https://your-backend.onrender.com/swagger-ui.html

# Test Endpoint
https://your-backend.onrender.com/api/auth/health
```

---

## 🐛 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| **502 Bad Gateway** | Check if app uses PORT env var |
| **Database Connection Error** | Verify JDBC URL format |
| **OAuth Not Working** | Update redirect URIs in console |
| **Build Fails** | Check Dockerfile & logs |
| **Slow Cold Start** | Upgrade to paid tier (no spin down) |

---

## 📊 Render Dashboard Quick Links

```bash
# View Logs
Dashboard → Your Service → Logs

# Environment Variables
Dashboard → Your Service → Environment

# Shell Access
Dashboard → Your Service → Shell

# Metrics
Dashboard → Your Service → Metrics

# Database Connection
Dashboard → PostgreSQL → Connection Info
```

---

## 🔐 Security Checklist

```bash
✅ Strong JWT secret (256+ bits)
✅ Unique database password
✅ Gmail App Password (not regular password)
✅ HTTPS enabled (Render default)
✅ .env files in .gitignore
✅ No secrets in code
✅ OAuth redirect URIs updated
```

---

## 🎯 Post-Deployment Actions

```bash
1. ✅ Test health endpoint
2. ✅ Test login (Google, GitHub, Email)
3. ✅ Test file upload (CV, certificates)
4. ✅ Test email sending
5. ✅ Monitor logs for errors
6. ✅ Update frontend API URL
7. ✅ Test end-to-end flow
```

---

## 💡 Pro Tips

- **Free Tier:** App spins down after 15min inactivity (30s cold start)
- **Database URL:** Use External URL (starts with dpg-xxxx.render.com)
- **Logs:** Download logs for better debugging
- **Auto-Deploy:** Push to branch = auto deployment
- **Secrets:** Generate strong randoms, never reuse

---

## 📞 Need More Details?

- **Full Environment Variables:** See `RENDER_ENV_VARIABLES.md`
- **Step-by-Step Guide:** See `RENDER_DEPLOYMENT_GUIDE.md`
- **Template File:** See `.env.example`

---

## 🔄 Update Existing Deployment

```bash
1. Update environment variables in Render Dashboard
2. Click "Manual Deploy" or push to branch
3. Monitor deployment logs
4. Test changes
```

---

## 🎉 Ready to Deploy?

```bash
✅ Check .env.example for required variables
✅ Follow RENDER_DEPLOYMENT_GUIDE.md
✅ Refer to RENDER_ENV_VARIABLES.md for details
✅ Use this file for quick reference
```

**Good luck with your deployment! 🚀**
