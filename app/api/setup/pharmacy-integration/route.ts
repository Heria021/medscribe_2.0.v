import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Setup pharmacy integration data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "doctor")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin or Doctor access required" },
        { status: 401 }
      );
    }

    const results = {
      pharmacies: null,
      drugInteractions: null,
      errors: [],
    };

    try {
      // Seed pharmacy data
      const pharmacyResult = await convex.mutation(api.pharmacies.seedPharmacyData, {});
      results.pharmacies = pharmacyResult;
    } catch (error) {
      results.errors.push(`Pharmacy seeding failed: ${error}`);
    }

    try {
      // Seed drug interaction data
      const interactionResult = await convex.mutation(api.drugInteractions.seedInteractionData, {});
      results.drugInteractions = interactionResult;
    } catch (error) {
      results.errors.push(`Drug interaction seeding failed: ${error}`);
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      message: results.errors.length === 0 
        ? "Pharmacy integration setup completed successfully"
        : "Setup completed with some errors",
      data: results,
    });

  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to setup pharmacy integration" 
      },
      { status: 500 }
    );
  }
}
