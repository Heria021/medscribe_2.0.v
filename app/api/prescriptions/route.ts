import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Create a new prescription
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
    const {
      patientId,
      medication,
      dosage,
      pharmacy,
      deliveryMethod = "electronic",
      priority = "routine",
      notes,
      appointmentId,
      treatmentPlanId,
    } = body;

    // Validate required fields
    if (!patientId || !medication || !dosage) {
      return NextResponse.json(
        { error: "Missing required fields: patientId, medication, dosage" },
        { status: 400 }
      );
    }

    // Get doctor profile
    const doctorProfile = await convex.query(api.doctors.getDoctorByUserId, {
      userId: session.user.id as any,
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Check for drug interactions
    const interactionCheck = await convex.query(api.prescriptions.checkDrugInteractions, {
      patientId: patientId as any,
      newMedication: medication.name,
    });

    // Check patient allergies
    const patientAllergies = await convex.query(api.patients.getPatientAllergies, {
      patientId: patientId as any,
    });

    // Create safety checks object
    const safetyChecks = {
      drugInteractions: interactionCheck.interactions.map((interaction: any) => ({
        severity: interaction.severity,
        description: interaction.description,
        interactingMedication: interaction.interactingMedication,
      })),
      allergyAlerts: patientAllergies
        .filter((allergy: any) =>
          medication.name.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
          (medication.genericName && medication.genericName.toLowerCase().includes(allergy.allergen.toLowerCase()))
        )
        .map((allergy: any) => ({
          allergen: allergy.allergen,
          severity: allergy.severity || "Unknown",
          reaction: allergy.reaction || "Unknown reaction",
        })),
      contraindications: [],
      dosageAlerts: [],
    };

    // Transform and filter pharmacy object to only include required fields
    let transformedPharmacy = null;
    if (pharmacy) {
      // Handle address transformation
      let addressString = pharmacy.address;
      if (typeof pharmacy.address === 'object') {
        addressString = `${pharmacy.address.street}, ${pharmacy.address.city}, ${pharmacy.address.state} ${pharmacy.address.zipCode}`;
      }

      // Only include the fields expected by the schema
      transformedPharmacy = {
        ncpdpId: pharmacy.ncpdpId,
        name: pharmacy.name,
        address: addressString,
        phone: pharmacy.phone,
      };
    }

    // Create prescription
    const prescriptionId = await convex.mutation(api.prescriptions.create, {
      patientId: patientId as any,
      doctorId: doctorProfile._id,
      appointmentId: appointmentId as any,
      treatmentPlanId: treatmentPlanId as any,
      medication,
      dosage,
      pharmacy: transformedPharmacy,
      deliveryMethod,
      priority,
      notes,
    });

    // Add safety checks
    await convex.mutation(api.prescriptions.addSafetyChecks, {
      prescriptionId,
      safetyChecks,
    });

    // If electronic delivery and no safety issues, attempt to send
    if (deliveryMethod === "electronic" && 
        safetyChecks.drugInteractions.length === 0 && 
        safetyChecks.allergyAlerts.length === 0) {
      
      try {
        const sendResult = await convex.action(api.prescriptions.sendElectronically, {
          prescriptionId,
        });

        return NextResponse.json({
          success: true,
          data: {
            prescriptionId,
            safetyChecks,
            sendResult,
          },
        });
      } catch (sendError) {
        console.error("Failed to send prescription electronically:", sendError);
        
        return NextResponse.json({
          success: true,
          data: {
            prescriptionId,
            safetyChecks,
            sendResult: {
              success: false,
              error: "Failed to send electronically - prescription saved as pending",
            },
          },
        });
      }
    } else {
      // Return with safety warnings for manual review
      return NextResponse.json({
        success: true,
        data: {
          prescriptionId,
          safetyChecks,
          requiresReview: true,
          message: "Prescription created but requires review due to safety alerts",
        },
      });
    }

  } catch (error) {
    console.error("Prescription creation error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to create prescription" 
      },
      { status: 500 }
    );
  }
}

// Get prescriptions for a doctor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "doctor") {
      return NextResponse.json(
        { error: "Unauthorized - Doctor access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    // Get doctor profile
    const doctorProfile = await convex.query(api.doctors.getDoctorByUserId, {
      userId: session.user.id as any,
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    let prescriptions;
    
    if (patientId) {
      // Get prescriptions for specific patient
      prescriptions = await convex.query(api.prescriptions.getByPatientId, {
        patientId: patientId as any,
      });
    } else {
      // Get all prescriptions for this doctor
      prescriptions = await convex.query(api.prescriptions.getByDoctorId, {
        doctorId: doctorProfile._id,
      });
    }

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });

  } catch (error) {
    console.error("Get prescriptions error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve prescriptions" 
      },
      { status: 500 }
    );
  }
}
