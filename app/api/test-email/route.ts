import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getGmailService } from "@/lib/gmail";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, subject, message } = body;

    // Validate input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message" },
        { status: 400 }
      );
    }

    // Test Gmail service configuration
    const gmailService = getGmailService();
    const gmailConfigured = gmailService !== null;
    
    let connectionTest = false;
    if (gmailService) {
      try {
        connectionTest = await gmailService.testConnection();
      } catch (error) {
        console.error("Gmail connection test failed:", error);
      }
    }

    // Prepare test email
    const emailOptions = {
      to,
      subject: `[TEST] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: #2563eb; margin-bottom: 30px;">Test Email from MedScribe</h1>
              
              <p style="font-size: 16px; margin-bottom: 30px;">
                ${message}
              </p>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #0277bd; margin-bottom: 15px;">Email Service Status</h3>
                <p><strong>Gmail Configured:</strong> ${gmailConfigured ? 'Yes' : 'No'}</p>
                <p><strong>Gmail Connection:</strong> ${connectionTest ? 'Working' : 'Failed'}</p>
                <p><strong>Mode:</strong> ${gmailConfigured && connectionTest ? 'Gmail API' : 'Console Logging'}</p>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                This is a test email sent from MedScribe application.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Test Email from MedScribe

${message}

---
Email Service Status:
Gmail Configured: ${gmailConfigured ? 'Yes' : 'No'}
Gmail Connection: ${connectionTest ? 'Working' : 'Failed'}
Sent at: ${new Date().toISOString()}
      `
    };

    // Send the email
    const success = await sendEmail(emailOptions);

    return NextResponse.json({
      success,
      message: success 
        ? "Test email sent successfully!" 
        : "Failed to send test email",
      emailService: {
        gmailConfigured,
        gmailConnection: connectionTest,
        mode: gmailConfigured && connectionTest ? 'Gmail API' : 'Console Logging'
      }
    });

  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
