# Environment Setup

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual credentials and configuration.

3. The application will automatically load environment variables from the `.env` file when running locally.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8081 |
| DATABASE_URL | Database connection URL | H2 in-memory |
| DATABASE_USERNAME | Database username | sa |
| DATABASE_PASSWORD | Database password | password |
| JWT_SECRET | JWT signing secret | Development key |
| GOOGLE_CLIENT_ID | Google OAuth client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | - |
| GITHUB_CLIENT_ID | GitHub OAuth client ID | - |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret | - |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | - |
| CLOUDINARY_API_KEY | Cloudinary API key | - |
| CLOUDINARY_API_SECRET | Cloudinary API secret | - |
| CLOUDINARY_PRESET | Cloudinary upload preset | OJTECHPDF |
| GEMINI_API_KEY | Google Gemini API key | - |
| EMAIL_ENABLED | Enable/disable email sending | true |
| BREVO_API_KEY | Brevo (Sendinblue) API key | - |
| BREVO_API_URL | Brevo API URL | https://api.brevo.com/v3/smtp/email |
| SPRING_MAIL_EMAIL | Verified sender email | ojtech.team@gmail.com |
| FRONTEND_URL | Frontend application URL | http://localhost:5173 |
| BACKEND_URL | Backend application URL | http://localhost:8081 |

## Production Deployment

For production deployment (e.g., Render), set these environment variables in your deployment platform:

- All variables from the table above
- Additional production-specific variables as needed

## Security Notes

- Never commit actual `.env` files to version control
- Use strong, unique secrets for production
- Rotate API keys regularly
- Keep `.env.example` in version control as a template
