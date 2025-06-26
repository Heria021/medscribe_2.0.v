import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Search pharmacies
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get("zipCode");
    const chainName = searchParams.get("chain");
    const limit = parseInt(searchParams.get("limit") || "20");

    let pharmacies;

    if (zipCode && chainName) {
      // Search by both zip code and chain
      pharmacies = await convex.query(api.pharmacies.searchByChain, {
        chainName,
        zipCode,
      });
    } else if (zipCode) {
      // Search by zip code only
      pharmacies = await convex.query(api.pharmacies.searchByZipCode, {
        zipCode,
        limit,
      });
    } else if (chainName) {
      // Search by chain only
      pharmacies = await convex.query(api.pharmacies.searchByChain, {
        chainName,
      });
    } else {
      // Get all active pharmacies (limited)
      const allPharmacies = await convex.query(api.pharmacies.getAllActive, {});
      pharmacies = allPharmacies.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: pharmacies,
      count: pharmacies.length,
    });

  } catch (error) {
    console.error("Pharmacy search error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to search pharmacies" 
      },
      { status: 500 }
    );
  }
}
