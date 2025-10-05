# Environment Variables Setup

This application uses environment variables to manage sensitive configuration. Follow these steps to set up your environment:

## Setup Instructions

### 1. Create a .env file

Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

### 2. Configure Your Environment Variables

Edit the `.env` file and replace the placeholder values with your actual credentials:

- **Database Configuration**: Set your H2 or PostgreSQL database credentials
- **JWT Configuration**: Use a strong, random secret key for JWT
- **Cloudinary**: Add your Cloudinary cloud name, API key, and secret
- **Google OAuth2**: Add your Google OAuth2 client ID and secret
- **GitHub OAuth2**: Add your GitHub OAuth2 client ID and secret
- **Gemini API**: Add your Google Gemini API key
- **Email**: Configure your SMTP email credentials

### 3. Using Environment Variables

The application is configured to read environment variables with fallback defaults. The syntax used in `application.properties` is:

```properties
property.name=${ENV_VAR_NAME:default_value}
```

This means:
- If `ENV_VAR_NAME` is set in your environment, it will be used
- If not, the `default_value` will be used

### 4. Setting Environment Variables

#### Option A: Using a .env file (Recommended for Development)

Spring Boot doesn't natively support `.env` files. You can use one of these methods:

**Method 1: Use spring-dotenv dependency**

Add this to your `pom.xml`:
```xml
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>
```

**Method 2: Export variables manually (Unix/Linux/Mac)**
```bash
export $(cat .env | xargs)
./mvnw spring-boot:run
```

**Method 3: Export variables manually (Windows CMD)**
```cmd
for /f "tokens=*" %i in (.env) do set %i
mvnw.cmd spring-boot:run
```

**Method 4: Export variables manually (Windows PowerShell)**
```powershell
Get-Content .env | ForEach-Object {
    $name, $value = $_.split('=')
    Set-Content env:\$name $value
}
.\mvnw.cmd spring-boot:run
```

#### Option B: Set System Environment Variables

You can set environment variables at the system level:

**Windows:**
1. Open System Properties → Advanced → Environment Variables
2. Add each variable from `.env.example`

**Mac/Linux:**
Add to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:
```bash
export DB_USERNAME=sa
export DB_PASSWORD=password
# ... etc
```

#### Option C: IDE Configuration

**IntelliJ IDEA:**
1. Run → Edit Configurations
2. Environment Variables → Add each variable

**VS Code:**
Add to your `launch.json`:
```json
{
    "configurations": [
        {
            "type": "java",
            "env": {
                "DB_USERNAME": "sa",
                "DB_PASSWORD": "password"
            }
        }
    ]
}
```

### 5. Production Deployment

For production (e.g., Render, Heroku, AWS):
- Set environment variables through the platform's dashboard
- Never commit your `.env` file to version control
- Use the platform's secret management features

#### Render.com Example:
In your `render.yaml` or Dashboard:
```yaml
envVars:
  - key: DB_URL
    value: your_database_url
  - key: JWT_SECRET
    value: your_jwt_secret
  # ... etc
```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit the `.env` file to git
- The `.env` file should be in `.gitignore`
- Only commit `.env.example` with placeholder values
- Rotate secrets regularly, especially if exposed
- Use different credentials for development and production

## Troubleshooting

**Variables not loading?**
- Verify the `.env` file is in the project root
- Check that variable names match exactly
- Ensure no spaces around `=` in `.env` file
- Try restarting your IDE or terminal

**Still using default values?**
- Spring Boot may be using the fallback defaults from `application.properties`
- This is normal if environment variables aren't set
- For development, the defaults should work fine

