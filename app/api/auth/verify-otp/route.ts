import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/otp-store";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Get stored OTP data
    const storedData = otpStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        { error: "No OTP found for this email. Please request a new one." },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp.toString()) {
      return NextResponse.json(
        { error: "Invalid OTP. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from store
    otpStore.delete(email);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
