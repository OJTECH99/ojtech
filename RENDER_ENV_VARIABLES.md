# Render Environment Variables Configuration

This document lists all environment variables required for deploying the OJTech Spring Boot backend on Render.

## 🚀 Required Environment Variables

### **1. Server Configuration**
```
PORT=8080
```
*Note: Render automatically sets PORT. You typically don't need to configure this manually.*

---

### **2. Database Configuration (PostgreSQL)**
```
SPRING_DATASOURCE_URL=jdbc:postgresql://<your-render-db-host>:<port>/<database-name>
SPRING_DATASOURCE_USERNAME=<your-db-username>
SPRING_DATASOURCE_PASSWORD=<your-db-password>
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

**Example:**
```
SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-xxxxx.oregon-postgres.render.com:5432/ojtech_db
SPRING_DATASOURCE_USERNAME=ojtech_user
SPRING_DATASOURCE_PASSWORD=your-secure-password-here
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
```

---

### **3. JPA/Hibernate Configuration**
```
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_JPA_PROPERTIES_HIBERNATE_FORMAT_SQL=false
```

---

### **4. JWT Configuration**
```
APP_JWT_SECRET=<your-long-random-secret-key-at-least-256-bits>
APP_JWT_EXPIRATION=86400000
APP_JWT_HEADER=Authorization
APP_JWT_PREFIX=Bearer 
```

**Example:**
```
APP_JWT_SECRET=YourSuperSecureRandomJwtSecretKeyForProductionAtLeast32CharactersLong123456
APP_JWT_EXPIRATION=86400000
```

*⚠️ IMPORTANT: Generate a secure random secret for production. Use a key generator.*

---

### **5. Cloudinary Configuration**
```
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLOUDINARY_API_SECRET_PRESET=OJTECHPDF
```

**Where to find:**
- Go to [Cloudinary Dashboard](https://cloudinary.com/console)
- Copy Cloud Name, API Key, and API Secret

---

### **6. File Upload Configuration**
```
SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE=10MB
SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE=10MB
FILE_UPLOAD_DIR=uploads
```

---

### **7. Google OAuth2 Configuration**
```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=<your-google-client-id>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_SCOPE=email,profile
```

**Where to find:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services > Credentials
- Create OAuth 2.0 Client ID or use existing one

---

### **8. GitHub OAuth2 Configuration**
```
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID=<your-github-client-id>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET=<your-github-client-secret>
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_SCOPE=user:email
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_REDIRECT_URI=${APP_BASE_URL}/auth/github/callback
```

**Where to find:**
- Go to [GitHub Developer Settings](https://github.com/settings/developers)
- OAuth Apps > Create New OAuth App or use existing
- Set Authorization callback URL to: `https://your-render-backend-url/auth/github/callback`

---

### **9. Gemini API Configuration**
```
GEMINI_API_KEY=<your-gemini-api-key>
```

**Where to find:**
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Generate API key

---

### **10. Email Configuration (Gmail SMTP)**
```
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=<your-gmail-address>
SPRING_MAIL_PASSWORD=<your-gmail-app-password>
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
```

**Example:**
```
SPRING_MAIL_USERNAME=ojtech.team@gmail.com
SPRING_MAIL_PASSWORD=abcd efgh ijkl mnop
```

*⚠️ NOTE: Use Gmail App Password, not your regular Gmail password!*

**How to get Gmail App Password:**
1. Go to Google Account Security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"

---

### **11. Application URLs**
```
APP_BASE_URL=https://your-frontend-url.com
BACKEND_BASE_URL=https://your-backend-url.onrender.com
```

**Example:**
```
APP_BASE_URL=https://ojtech.netlify.app
BACKEND_BASE_URL=https://ojtech-backend.onrender.com
```

*⚠️ IMPORTANT: Update these after deploying your frontend and backend!*

---

### **12. Logging Configuration**
```
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO
LOGGING_LEVEL_COM_MELARDEV_SPRING_JWTOAUTH=INFO
```

*Note: Use INFO or WARN in production instead of DEBUG*

---

### **13. OAuth2 Legacy Configuration (Optional)**
```
APP_SECURITY_OAUTH2_ACCESS_TOKEN_VALIDITY_SECONDS=2592000
APP_SECURITY_OAUTH2_REFRESH_TOKEN_VALIDITY_SECONDS=2592000
```

---

## 📋 Quick Checklist for Render Deployment

- [ ] PostgreSQL database created on Render
- [ ] All database credentials added to environment variables
- [ ] JWT secret generated (minimum 256 bits)
- [ ] Cloudinary credentials configured
- [ ] Google OAuth2 app credentials added
- [ ] GitHub OAuth2 app credentials added
- [ ] Gmail app password generated and added
- [ ] Gemini API key added
- [ ] Frontend URL added to APP_BASE_URL
- [ ] Backend URL added to BACKEND_BASE_URL (after deployment)
- [ ] OAuth redirect URIs updated in Google/GitHub settings

---

## 🔧 How to Add Environment Variables in Render

1. Go to your Render dashboard
2. Select your Web Service
3. Navigate to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable one by one
6. Click **Save Changes**
7. Render will automatically redeploy your service

---

## 🔒 Security Best Practices

1. **Never commit secrets** to version control
2. Use **strong random passwords** for production
3. Rotate secrets periodically
4. Use different credentials for dev/staging/prod
5. Enable HTTPS only in production
6. Use environment-specific OAuth redirect URIs

---

## 📝 Notes

- Render automatically provides `PORT` environment variable
- Database URL from Render PostgreSQL includes connection parameters
- Use internal database URL if backend and DB are on same Render account
- Spring Boot automatically converts environment variables:
  - `SPRING_DATASOURCE_URL` → `spring.datasource.url`
  - Underscores (`_`) become dots (`.`)
  - Uppercase becomes lowercase

---

## 🚨 Common Issues

### Issue: "Connection refused" to database
**Solution:** Ensure SPRING_DATASOURCE_URL uses external database URL from Render

### Issue: OAuth2 redirect not working
**Solution:** Update redirect URIs in Google/GitHub console to match your Render backend URL

### Issue: Email sending fails
**Solution:** Verify Gmail App Password is correct and 2FA is enabled

### Issue: File uploads fail
**Solution:** Verify Cloudinary credentials and preset name

---

## 📞 Support

For issues related to:
- **Render**: Check [Render Docs](https://render.com/docs)
- **PostgreSQL**: Check Render PostgreSQL logs
- **OAuth2**: Verify credentials in respective developer consoles
- **Cloudinary**: Check [Cloudinary Docs](https://cloudinary.com/documentation)
