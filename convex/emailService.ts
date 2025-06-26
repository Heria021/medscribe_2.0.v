// Email service for Convex actions
// This integrates Gmail API directly into Convex

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailTemplateData {
  firstName?: string;
  role?: string;
  patientName?: string;
  doctorName?: string;
  appointmentDetails?: any;
  treatmentDetails?: any;
  medicationDetails?: any;
  alertDetails?: any;
  maintenanceDetails?: any;
  lastLoginDate?: string;
  completionPercentage?: number;
  missingFields?: string[];
}

// Generate email content based on type and template data
export function generateEmailContent(
  emailType: string,
  to: string,
  templateData: EmailTemplateData
): EmailOptions {
  switch (emailType) {
    case "welcome":
      return generateWelcomeEmailContent(to, templateData.firstName!, templateData.role!);

    case "profile_completion_reminder":
      return generateProfileCompletionReminderContent(
        to,
        templateData.firstName!,
        templateData.role!,
        templateData.completionPercentage!,
        templateData.missingFields!
      );

    case "appointment_reminder_24h":
    case "appointment_reminder_1h":
      return generateAppointmentReminderContent(
        to,
        templateData.patientName!,
        templateData.doctorName!,
        templateData.appointmentDetails!,
        emailType === "appointment_reminder_1h" ? "1h" : "24h"
      );
    
    case "appointment_followup":
      return generateAppointmentFollowupContent(
        to,
        templateData.patientName!,
        templateData.doctorName!,
        templateData.appointmentDetails!
      );
    
    case "inactive_user_reengagement":
      return generateInactiveUserContent(
        to,
        templateData.firstName!,
        templateData.role!,
        templateData.lastLoginDate!
      );
    
    case "security_alert":
      return generateSecurityAlertContent(
        to,
        templateData.firstName!,
        templateData.alertDetails!
      );
    
    default:
      return {
        to,
        subject: `MedScribe Notification: ${emailType}`,
        html: `<p>Hello,</p><p>You have a new notification from MedScribe.</p>`,
        text: `Hello, You have a new notification from MedScribe.`
      };
  }
}

function generateWelcomeEmailContent(email: string, firstName: string, role: string): EmailOptions {
  return {
    to: email,
    subject: "Welcome to MedScribe!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to MedScribe!</h1>
        <p>Hello ${firstName},</p>
        <p>Welcome to MedScribe! We're excited to have you join our healthcare platform as a ${role}.</p>
        <p>Your account has been successfully created and you can now access all the features available to you.</p>
        <p>Best regards,<br>The MedScribe Team</p>
      </div>
    `,
    text: `Welcome to MedScribe! Hello ${firstName}, Welcome to MedScribe! We're excited to have you join our healthcare platform as a ${role}.`
  };
}



function generateAppointmentReminderContent(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDetails: any,
  reminderType: "24h" | "1h"
): EmailOptions {
  const timeUntil = reminderType === "24h" ? "24 hours" : "1 hour";
  const urgency = reminderType === "1h" ? "URGENT: " : "";

  return {
    to: patientEmail,
    subject: `${urgency}Appointment Reminder - ${appointmentDetails.date} at ${appointmentDetails.time}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${reminderType === "1h" ? "#dc2626" : "#2563eb"};">
          ${reminderType === "1h" ? "🚨 " : "📅 "}Appointment Reminder
        </h1>
        <p>Dear ${patientName},</p>
        <p>This is a reminder that you have an appointment with Dr. ${doctorName} in ${timeUntil}.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${appointmentDetails.date}</p>
          <p><strong>Time:</strong> ${appointmentDetails.time}</p>
          <p><strong>Type:</strong> ${appointmentDetails.type}</p>
          <p><strong>Reason:</strong> ${appointmentDetails.visitReason}</p>
        </div>
        <p>Please arrive 15 minutes early for in-person appointments.</p>
        <p>Best regards,<br>The MedScribe Team</p>
      </div>
    `,
    text: `${urgency}Appointment Reminder. Dear ${patientName}, You have an appointment with Dr. ${doctorName} in ${timeUntil} on ${appointmentDetails.date} at ${appointmentDetails.time}.`
  };
}

function generateAppointmentFollowupContent(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDetails: any
): EmailOptions {
  return {
    to: patientEmail,
    subject: "Follow-up: Your Recent Appointment",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Thank You for Your Visit</h1>
        <p>Dear ${patientName},</p>
        <p>Thank you for your recent appointment with Dr. ${doctorName} on ${appointmentDetails.date}. We hope you had a positive experience.</p>
        <p>If you have any questions about your treatment or need to schedule a follow-up appointment, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The MedScribe Team</p>
      </div>
    `,
    text: `Thank you for your recent appointment with Dr. ${doctorName} on ${appointmentDetails.date}. If you have any questions, please contact us.`
  };
}

function generateInactiveUserContent(
  email: string,
  firstName: string,
  role: string,
  lastLoginDate: string
): EmailOptions {
  return {
    to: email,
    subject: "We Miss You at MedScribe!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">We Miss You! 👋</h1>
        <p>Hello ${firstName},</p>
        <p>We noticed you haven't logged into MedScribe since ${lastLoginDate}. We miss you and wanted to check in!</p>
        <p>We've made several improvements to the platform that you might find useful.</p>
        <p>We'd love to have you back!</p>
        <p>Best regards,<br>The MedScribe Team</p>
      </div>
    `,
    text: `We Miss You! Hello ${firstName}, We noticed you haven't logged in since ${lastLoginDate}. We'd love to have you back!`
  };
}

function generateSecurityAlertContent(
  email: string,
  firstName: string,
  alertDetails: any
): EmailOptions {
  return {
    to: email,
    subject: `🚨 Security Alert: ${alertDetails.alertType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">🚨 Security Alert</h1>
        <p>Hello ${firstName},</p>
        <p>We detected unusual activity on your MedScribe account:</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3>Alert Details:</h3>
          <p><strong>Type:</strong> ${alertDetails.alertType}</p>
          <p><strong>Description:</strong> ${alertDetails.description}</p>
          <p><strong>Time:</strong> ${alertDetails.timestamp}</p>
        </div>
        <p>If this was you, you can safely ignore this email. If not, please contact us immediately.</p>
        <p>Best regards,<br>The MedScribe Team</p>
      </div>
    `,
    text: `Security Alert: ${alertDetails.alertType}. ${alertDetails.description} at ${alertDetails.timestamp}. If this wasn't you, please contact us.`
  };
}

// Production email sending function with direct Gmail API integration
export async function sendEmailProduction(emailOptions: EmailOptions): Promise<boolean> {
  try {
    // Use Gmail API directly from Convex
    const gmailConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
      user: process.env.GMAIL_USER!,
    };

    // Check if Gmail is configured
    if (!gmailConfig.clientId || !gmailConfig.clientSecret || !gmailConfig.refreshToken || !gmailConfig.user) {
      return false;
    }

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: gmailConfig.clientId,
        client_secret: gmailConfig.clientSecret,
        refresh_token: gmailConfig.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create email message
    const emailMessage = [
      `To: ${emailOptions.to}`,
      `From: ${gmailConfig.user}`,
      `Subject: ${emailOptions.subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      emailOptions.html
    ].join('\n');

    // Encode email in base64url (Convex-compatible)
    const base64 = btoa(unescape(encodeURIComponent(emailMessage)));
    const encodedMessage = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email via Gmail API
    const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (sendResponse.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
