# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for MedScribe.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "MedScribe Auth")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and then "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: MedScribe
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes (optional for basic setup):
   - `email`
   - `profile`
   - `openid`
5. Add test users if needed (for development)
6. Save and continue

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Configure the settings:
   - **Name**: MedScribe Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 5: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth (if not already set)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## Step 6: Update Production Settings

For production deployment:

1. Update the authorized origins and redirect URIs in Google Cloud Console
2. Update the `NEXTAUTH_URL` environment variable to your production domain
3. Ensure all environment variables are set in your production environment

## Security Considerations

1. **Keep credentials secure**: Never commit your Google Client Secret to version control
2. **Use environment variables**: Store all sensitive data in environment variables
3. **Restrict domains**: Only add necessary domains to authorized origins
4. **Regular rotation**: Consider rotating your client secret periodically
5. **Monitor usage**: Check Google Cloud Console for unusual activity

## Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. Complete the OAuth flow
5. Select your role (doctor/patient)
6. Verify you're redirected to the appropriate dashboard

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Cloud Console matches exactly
   - Ensure you're using the correct protocol (http vs https)

2. **"invalid_client" error**:
   - Verify your Client ID and Client Secret are correct
   - Check that the OAuth consent screen is properly configured

3. **"access_denied" error**:
   - User cancelled the OAuth flow
   - Check OAuth consent screen configuration

4. **Role selection not working**:
   - Ensure Convex is running (`npx convex dev`)
   - Check browser console for errors
   - Verify database schema is up to date

### Debug Mode

Enable debug mode by adding to your `.env.local`:

```env
NEXTAUTH_DEBUG=true
```

This will provide detailed logs in your server console.

## Production Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Production domains added to authorized origins
- [ ] Environment variables set in production
- [ ] SSL certificate configured (required for production OAuth)
- [ ] Test OAuth flow in production environment
