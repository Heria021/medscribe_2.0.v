// Shared OTP store for development
// In production, this should be replaced with Redis or a database

interface OTPData {
  otp: string;
  expires: number;
  attempts: number;
}

// Use a global variable to persist across serverless function calls
declare global {
  var __otpStore: Map<string, OTPData> | undefined;
}

class OTPStore {
  private static instance: OTPStore;
  private store: Map<string, OTPData>;

  private constructor() {
    // Use global variable to persist store across serverless invocations
    if (!global.__otpStore) {
      global.__otpStore = new Map();
    }
    this.store = global.__otpStore;

    // Clean up expired OTPs every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  public static getInstance(): OTPStore {
    if (!OTPStore.instance) {
      OTPStore.instance = new OTPStore();
    }
    return OTPStore.instance;
  }

  public set(email: string, data: OTPData): void {
    const normalizedEmail = email.toLowerCase();
    this.store.set(normalizedEmail, data);
  }

  public get(email: string): OTPData | undefined {
    const normalizedEmail = email.toLowerCase();
    return this.store.get(normalizedEmail);
  }

  public delete(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    return this.store.delete(normalizedEmail);
  }

  public has(email: string): boolean {
    return this.store.has(email.toLowerCase());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [email, data] of this.store.entries()) {
      if (data.expires < now) {
        this.store.delete(email);
      }
    }
  }


}

export const otpStore = OTPStore.getInstance();
export type { OTPData };
