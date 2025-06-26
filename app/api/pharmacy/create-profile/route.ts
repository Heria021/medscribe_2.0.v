import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      userId,
      name,
      licenseNumber,
      phone,
      email,
      ncpdpId,
      address,
      deaNumber,
      npiNumber,
      pharmacistInCharge,
      chainName,
      isActive = true,
      isVerified = false,
    } = body;

    if (!userId || !name || !licenseNumber || !phone || !email || !ncpdpId || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create pharmacy profile in Convex
    const pharmacyId = await convex.mutation(api.pharmacies.createPharmacy, {
      userId,
      name,
      licenseNumber,
      phone,
      email,
      ncpdpId,
      address,
      deaNumber,
      npiNumber,
      pharmacistInCharge,
      chainName,
      isActive,
      isVerified,
    });

    return NextResponse.json({
      success: true,
      pharmacyId,
      message: "Pharmacy profile created successfully",
    });

  } catch (error) {
    console.error("Pharmacy profile creation error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to create pharmacy profile" 
      },
      { status: 500 }
    );
  }
}
