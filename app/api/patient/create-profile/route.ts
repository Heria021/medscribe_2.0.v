import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, firstName, lastName, email, dateOfBirth, gender } = body;

    // Validate required fields
    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create patient profile
    const patientId = await convex.mutation(api.patients.createPatientProfile, {
      userId,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || new Date().toISOString().split('T')[0], // Default to today if not provided
      gender: gender || "Male",
      email,
      phone: "",
    });

    return NextResponse.json({ success: true, patientId });
  } catch (error) {
    console.error("Error creating patient profile:", error);
    return NextResponse.json(
      { error: "Failed to create patient profile" },
      { status: 500 }
    );
  }
}
