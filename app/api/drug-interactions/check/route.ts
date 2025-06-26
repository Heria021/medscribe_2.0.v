import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Check drug interactions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Unauthorized - Doctor access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { medications, newMedication, patientId } = body;

    if (!medications && !newMedication && !patientId) {
      return NextResponse.json(
        { error: "Must provide either medications list, newMedication with patientId, or both" },
        { status: 400 }
      );
    }

    let interactionResults;

    if (patientId && newMedication) {
      // Check new medication against patient's current medications
      interactionResults = await convex.query(api.prescriptions.checkDrugInteractions, {
        patientId: patientId as any,
        newMedication,
      });
    } else if (medications && medications.length > 1) {
      // Check interactions within a list of medications
      interactionResults = await convex.query(api.drugInteractions.checkMultipleInteractions, {
        medications,
      });
    } else if (medications && medications.length === 2) {
      // Check interaction between two specific drugs
      const interaction = await convex.query(api.drugInteractions.checkInteraction, {
        drug1: medications[0],
        drug2: medications[1],
      });
      
      interactionResults = {
        hasInteractions: !!interaction,
        interactions: interaction ? [interaction] : [],
        currentMedications: medications,
      };
    } else {
      return NextResponse.json(
        { error: "Invalid medication data provided" },
        { status: 400 }
      );
    }

    // Categorize interactions by severity
    const categorizedInteractions = {
      major: interactionResults.interactions?.filter((i: any) => i.severity === "major") || [],
      moderate: interactionResults.interactions?.filter((i: any) => i.severity === "moderate") || [],
      minor: interactionResults.interactions?.filter((i: any) => i.severity === "minor") || [],
    };

    // Generate recommendations based on interactions
    const recommendations = [];
    
    if (categorizedInteractions.major.length > 0) {
      recommendations.push({
        type: "warning",
        message: "MAJOR drug interactions detected. Consider alternative medications.",
        priority: "high",
      });
    }
    
    if (categorizedInteractions.moderate.length > 0) {
      recommendations.push({
        type: "caution",
        message: "Moderate drug interactions detected. Monitor patient closely.",
        priority: "medium",
      });
    }
    
    if (categorizedInteractions.minor.length > 0) {
      recommendations.push({
        type: "info",
        message: "Minor drug interactions detected. Consider timing of administration.",
        priority: "low",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasInteractions: interactionResults.hasInteractions,
        totalInteractions: interactionResults.interactions?.length || 0,
        interactions: interactionResults.interactions || [],
        categorizedInteractions,
        recommendations,
        currentMedications: interactionResults.currentMedications || medications,
      },
    });

  } catch (error) {
    console.error("Drug interaction check error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to check drug interactions" 
      },
      { status: 500 }
    );
  }
}
