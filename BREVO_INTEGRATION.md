# Brevo Email Service Integration

## Overview

This project has been successfully integrated with Brevo (formerly Sendinblue) email service, replacing Gmail SMTP. The integration provides both SMTP and REST API capabilities for enhanced email functionality.

## Configuration

### API Key
Your Brevo API key has been configured:
```
brevo.api.key=eyJhcGlfa2V5IjoieGtleXNpYi0xOThmODUyNWFlOGM2YjQzNTY3ZDE4ZWU1NTVjNjA0NjQzOWFlOTc5NjYxY2ZjNzU5YmRjM2FkZDQ3NTM4ODNlLWNleXNmWldrOFNKeXpEMXgifQ==
```

### SMTP Configuration
- **Host**: smtp-relay.brevo.com
- **Port**: 587 (with STARTTLS)
- **Username**: 991830001@smtp-brevo.com
- **Password**: BvjfGq62ZJ5Q9m07

### API Configuration
- **API URL**: https://api.brevo.com/v3
- **Authentication**: API Key in header

## Features

### 1. Dual Email Delivery Methods
- **Primary**: Brevo REST API (recommended for advanced features)
- **Fallback**: SMTP (automatic fallback if API fails)

### 2. Email Types Supported
- **Verification Emails**: User registration email verification
- **User Creation Emails**: Admin-created user notifications
- **Job Application Emails**: Application forwarding to employers

### 3. Enhanced Features
- HTML and text content support
- Automatic fallback mechanism
- Improved error handling and logging
- Better email templates with consistent branding

## Implementation Details

### New Services
1. **BrevoEmailService**: Core service handling Brevo API integration
2. **EmailService**: Wrapper service maintaining backward compatibility

### Key Benefits
- **Reliability**: Automatic fallback from API to SMTP
- **Performance**: REST API is generally faster than SMTP
- **Features**: Access to Brevo's advanced email features
- **Monitoring**: Better delivery tracking and analytics
- **Scalability**: Higher sending limits compared to Gmail

## Dependencies Added
- `spring-boot-starter-webflux`: For HTTP client support
- `jackson-databind`: For JSON processing
- `RestTemplate` bean for API calls

## Environment Variables (Production)
For production deployment, set these environment variables:
- `BREVO_API_KEY`: Your Brevo API key
- `BREVO_API_URL`: Brevo API endpoint (default: https://api.brevo.com/v3)
- `MAIL_HOST`: SMTP host (default: smtp-relay.brevo.com)
- `MAIL_PORT`: SMTP port (default: 587)
- `MAIL_USERNAME`: Your Brevo SMTP username
- `MAIL_PASSWORD`: Your Brevo SMTP password

## Testing

To test the email functionality:

1. **Start the application**:
   ```bash
   ./mvnw spring-boot:run
   ```

2. **Register a new user** through the API or frontend to trigger verification email

3. **Check logs** for email sending confirmation:
   ```
   Email sent successfully via Brevo API to: user@example.com
   ```

## Troubleshooting

### Common Issues
1. **API Key Invalid**: Verify the API key is correctly set
2. **SMTP Authentication**: Ensure SMTP credentials are correct
3. **Network Issues**: Check firewall settings for outbound connections

### Fallback Behavior
If Brevo API fails, the system automatically attempts SMTP delivery. Both failures will result in an exception being thrown.

## Migration Benefits

### From Gmail to Brevo:
- ✅ Higher sending limits
- ✅ Better deliverability
- ✅ Professional email service
- ✅ Advanced analytics and tracking
- ✅ No 2FA complications
- ✅ Dedicated SMTP relay
- ✅ REST API access

The integration is complete and ready for use. All existing email functionality will continue to work seamlessly with improved reliability and features.
