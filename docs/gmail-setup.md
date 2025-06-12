# Gmail API Setup for Email Services

MedScribe uses Gmail API for sending emails. This document explains how to set up Gmail API integration.

## Email Features

The application sends emails for:

1. **Welcome emails** - When users register
2. **Password reset emails** - When users request password reset  
3. **Appointment confirmation emails** - When appointments are scheduled
4. **Login notification emails** - When users sign in (security feature)

## Prerequisites

- Google Cloud Console account
- Gmail account for sending emails
- Google OAuth 2.0 credentials

## Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen if prompted
4. Choose "Web application" as application type
5. Add authorized redirect URIs:
   - `https://developers.google.com/oauthplayground`
6. Save and note down:
   - Client ID
   - Client Secret

### Step 3: Get Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. In "Select & authorize APIs":
   - Enter: `https://www.googleapis.com/auth/gmail.send`
   - Click "Authorize APIs"
6. Sign in with your Gmail account
7. Click "Exchange authorization code for tokens"
8. Copy the "Refresh token"

### Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth (existing - used for login)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Gmail API Configuration (add these new ones)
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_REFRESH_TOKEN=your-refresh-token-from-step-3

# Required for email links
NEXTAUTH_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

## Environment Variables Explained

- `GOOGLE_CLIENT_ID` - OAuth client ID (used for both login and Gmail)
- `GOOGLE_CLIENT_SECRET` - OAuth client secret (used for both login and Gmail)
- `GMAIL_USER` - Gmail address that will send emails
- `GMAIL_REFRESH_TOKEN` - Refresh token for Gmail API access
- `NEXTAUTH_URL` - Base URL for password reset links
- `SITE_URL` - Base URL for API calls from Convex actions

## How It Works

The Gmail integration:
- Uses Gmail API for sending emails when configured
- Falls back to console logging for development when not configured
- Works automatically with all email features
- Handles authentication via OAuth 2.0 refresh tokens

## Testing

To test if Gmail is working:

1. **Register a new user** - Should send welcome email
2. **Try forgot password** - Should send reset email
3. **Create an appointment** - Should send confirmation email
4. **Sign in** - Should send login notification

If Gmail is not configured, emails will be logged to console instead.

## Development vs Production

### Development Mode
- If Gmail API is not configured, emails are logged to console
- No actual emails are sent
- All email functionality works for testing

### Production Setup
- Gmail API must be properly configured
- All environment variables must be set
- Consider using a dedicated Gmail account for sending emails
- Monitor Gmail API quotas and limits

## Troubleshooting

### Common Issues

1. **"Gmail service not configured"**
   - Check all environment variables are set
   - Verify Client ID and Secret are correct

2. **"Invalid credentials"**
   - Refresh token may have expired
   - Re-generate refresh token using OAuth playground

3. **"Insufficient permissions"**
   - Ensure Gmail API is enabled in Google Cloud Console
   - Check OAuth scope includes `gmail.send`

4. **"Quota exceeded"**
   - Gmail API has daily sending limits
   - Consider upgrading to paid Google Cloud account

### Debug Mode

Check console logs for detailed error messages. In development mode, emails will be logged even if Gmail fails.

## Security Considerations

- Never commit credentials to version control
- Use environment variables for all sensitive data
- Consider using a dedicated Gmail account for sending emails
- Regularly monitor API usage and quotas
- Set up proper OAuth consent screen for production

## Gmail API Limits

- **Free tier**: 1 billion quota units per day
- **Sending emails**: ~25 quota units per email
- **Rate limits**: 250 quota units per user per 100 seconds

For high-volume applications, consider upgrading to paid Google Cloud services.
