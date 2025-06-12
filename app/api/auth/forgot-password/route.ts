import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmail, generatePasswordResetEmail } from "@/lib/email";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Create password reset token
    const result = await convex.mutation(api.users.createPasswordResetToken, {
      email: validatedData.email,
    });

    // Send password reset email
    const emailOptions = generatePasswordResetEmail(result.email, result.token);

    try {
      await sendEmail(emailOptions);
      return NextResponse.json({
        success: true,
        message: "Password reset email sent successfully.",
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send email. Please ensure Gmail API is enabled and configured properly.",
          details: emailError instanceof Error ? emailError.message : "Unknown email error"
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Forgot password error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Don't reveal whether the email exists or not for security
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
    });
  }
}
