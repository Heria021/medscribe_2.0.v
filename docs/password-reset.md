# Password Reset Feature

This document explains the forgot password and reset password functionality implemented in MedScribe.

## Overview

The password reset feature allows users to securely reset their passwords when they forget them. The implementation includes:

1. **Forgot Password Flow**: Users can request a password reset link
2. **Reset Password Flow**: Users can set a new password using a secure token
3. **Security Features**: Tokens expire after 1 hour and can only be used once

## How It Works

### 1. Forgot Password Process

1. User clicks "Forgot password?" link on the login page
2. User enters their email address
3. System generates a secure reset token and stores it in the database
4. System sends an email with the reset link (currently logs to console for development)
5. User receives confirmation that the email was sent

### 2. Reset Password Process

1. User clicks the reset link from their email
2. System validates the token (checks if it exists, hasn't been used, and hasn't expired)
3. User enters their new password
4. System updates the user's password and marks the token as used
5. User is redirected to login with their new password

## API Endpoints

### POST /api/auth/forgot-password

Request a password reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, we've sent a password reset link."
}
```

### POST /api/auth/reset-password

Reset password using a token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

## Database Schema

### passwordResetTokens Table

- `userId`: Reference to the user
- `token`: Unique reset token
- `expiresAt`: Token expiration timestamp (1 hour from creation)
- `isUsed`: Whether the token has been used
- `createdAt`: Token creation timestamp

## Security Features

1. **Token Expiration**: Tokens expire after 1 hour
2. **Single Use**: Tokens can only be used once
3. **Secure Generation**: Tokens are generated using random values and timestamps
4. **Email Validation**: Only valid email formats are accepted
5. **Password Requirements**: New passwords must meet security requirements
6. **No Information Disclosure**: System doesn't reveal whether an email exists

## Development vs Production

### Development Mode
- Password reset emails are logged to the console
- Reset URLs are displayed in the server logs
- No actual email sending occurs

### Production Setup
To enable actual email sending in production:

1. Choose an email service (Resend, SendGrid, AWS SES, etc.)
2. Update `lib/email.ts` to integrate with your chosen service
3. Add necessary environment variables for email configuration
4. Test the email delivery in a staging environment

## Usage Examples

### From Login Page
Users can click the "Forgot password?" link on the login page to start the reset process.

### From Settings Pages
Both doctor and patient settings pages have "Forgot Password" buttons that trigger the reset flow for the current user.

### Direct URL Access
Users can access the forgot password page directly at `/auth/forgot-password`.

## Testing

To test the password reset functionality:

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Click "Forgot password?"
4. Enter a valid email address
5. Check the server console for the reset token and URL
6. Copy the reset URL and paste it in your browser
7. Enter a new password and confirm
8. Try logging in with the new password

## Error Handling

The system handles various error scenarios:

- Invalid email format
- Non-existent email addresses
- Expired tokens
- Already used tokens
- Password validation errors
- Network errors

All errors are handled gracefully with appropriate user feedback.
