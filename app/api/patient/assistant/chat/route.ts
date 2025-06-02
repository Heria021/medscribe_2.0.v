import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { searchRAG } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "patient") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, patient_id } = body;

    // Validate required fields
    if (!message || !patient_id) {
      return NextResponse.json(
        { error: "Missing required fields: message, patient_id" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length < 1) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Get patient profile for fallback
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const patientProfile = await convex.query(api.patients.getPatientByUserId, {
      userId: session.user.id as any
    });

    if (!patientProfile) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Search RAG system for relevant information
    try {
      const searchResponse = await searchRAG({
        patient_id,
        query: message.trim(),
        similarity_threshold: 0.2,
        max_results: 5,
        include_context: true
      });

      console.log("RAG Response:", JSON.stringify(searchResponse, null, 2));

      if (searchResponse.success && searchResponse.response && searchResponse.response.length > 0) {
        // Return the RAG response in the expected format
        return NextResponse.json({
          success: true,
          data: {
            message: searchResponse.response,
            relevant_documents: searchResponse.relevant_documents || [],
            relevant_documents_count: searchResponse.relevant_documents_count || 0,
            context_used: searchResponse.context_used || false,
            similarity_threshold: searchResponse.similarity_threshold,
            processing_time: searchResponse.processing_time_seconds,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // Fallback response when no RAG results or response is empty
        const patientName = patientProfile.firstName || "there";
        return NextResponse.json({
          success: true,
          data: {
            message: `Hello ${patientName}! I don't have enough information about "${message}" in your medical records yet. As you continue to use the system and generate more SOAP notes, I'll be able to provide more detailed assistance. Is there anything specific about your current health status or medical records you'd like to discuss?`,
            relevant_documents: [],
            relevant_documents_count: 0,
            context_used: false,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (ragError) {
      console.error("RAG search error:", ragError);

      // Fallback response on RAG error
      const patientName = patientProfile.firstName || "there";
      return NextResponse.json({
        success: true,
        data: {
          message: `Hello ${patientName}! I'm having trouble accessing your medical records right now. Please try again in a moment, or contact support if the issue persists.`,
          relevant_documents: [],
          relevant_documents_count: 0,
          context_used: false,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error("Assistant chat API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong. Please try again." 
      },
      { status: 500 }
    );
  }
}