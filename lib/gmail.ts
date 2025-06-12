import { google } from 'googleapis';

interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  user: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class GmailService {
  private oauth2Client: any;
  private gmail: any;
  private config: GmailConfig;

  constructor(config: GmailConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    this.oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.gmail.users.getProfile({ userId: 'me' });
      console.log('Gmail API connection verified successfully');
      return true;
    } catch (error) {
      console.error('Gmail API connection failed:', error);
      return false;
    }
  }

  private createMessage(options: EmailOptions): string {
    const messageParts = [
      `From: ${this.config.user}`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"',
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=utf-8',
      '',
      options.text || options.html.replace(/<[^>]*>/g, ''),
      '',
      '--boundary123',
      'Content-Type: text/html; charset=utf-8',
      '',
      options.html,
      '',
      '--boundary123--'
    ];

    return messageParts.join('\n');
  }

  private encodeMessage(message: string): string {
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const message = this.createMessage(options);
      const encodedMessage = this.encodeMessage(message);

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log('Email sent successfully:', response.data.id);
      return true;
    } catch (error) {
      console.error('Failed to send email via Gmail:', error);
      return false;
    }
  }
}

// Create Gmail service instance
let gmailService: GmailService | null = null;

export function getGmailService(): GmailService | null {
  if (!gmailService) {
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
      user: process.env.GMAIL_USER!,
    };

    // Check if all required environment variables are present
    if (!config.clientId || !config.clientSecret || !config.refreshToken || !config.user) {
      console.warn('Gmail service not configured. Missing environment variables.');
      return null;
    }

    gmailService = new GmailService(config);
  }

  return gmailService;
}

export { GmailService };
export type { EmailOptions };
