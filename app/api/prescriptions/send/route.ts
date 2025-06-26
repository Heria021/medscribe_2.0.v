import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Send prescription electronically
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
    const { prescriptionId } = body;

    if (!prescriptionId) {
      return NextResponse.json(
        { error: "Missing prescriptionId" },
        { status: 400 }
      );
    }

    // Get prescription details
    const prescription = await convex.query(api.prescriptions.getById, {
      prescriptionId: prescriptionId as any,
    });

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this prescription
    const doctorProfile = await convex.query(api.doctors.getDoctorByUserId, {
      userId: session.user.id as any,
    });

    if (!doctorProfile || prescription.doctorId !== doctorProfile._id) {
      return NextResponse.json(
        { error: "Unauthorized - Not your prescription" },
        { status: 403 }
      );
    }

    // Check if prescription is in sendable state
    if (prescription.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot send prescription with status: ${prescription.status}` },
        { status: 400 }
      );
    }

    // Send prescription electronically
    const sendResult = await convex.action(api.prescriptions.sendElectronically, {
      prescriptionId: prescriptionId as any,
    });

    return NextResponse.json({
      success: true,
      data: sendResult,
    });

  } catch (error) {
    console.error("Send prescription error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to send prescription" 
      },
      { status: 500 }
    );
  }
}
