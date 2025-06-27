"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatientAuth } from "@/hooks/use-patient-auth";

// Hooks
import { usePatientProfile, useDoctorConversations } from "./hooks";

// Components
import {
  ChatPageHeader,
  ChatEmptyState,
  ChatSkeleton,
  DoctorConversationList,
  DoctorChatInterface,
  ChatErrorBoundary,
  ChatLoadingOverlay,
} from "./components";

const PatientChat: React.FC = () => {
  const router = useRouter();
  const { session, isLoading: authLoading, isAuthenticated } = usePatientAuth();

  // Custom hooks for data and state management
  const { profile: patientProfile, isLoading: profileLoading } = usePatientProfile();
  const {
    conversations,
    selectedDoctorId,
    selectedDoctor,
    isLoading: conversationsLoading,
    selectDoctor,
    clearSelection,
  } = useDoctorConversations(patientProfile);

  // Authentication and authorization
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Memoize loading state
  const isLoading = useMemo(() => {
    return authLoading || (session?.user?.id && profileLoading);
  }, [authLoading, session?.user?.id, profileLoading]);

  // Show loading skeleton while session or profile is loading
  if (isLoading) {
    return <ChatSkeleton />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Error state for missing patient profile
  if (session?.user?.id && patientProfile === null) {
    return (
      <div className="h-full flex flex-col space-y-4">
        <ChatPageHeader
          title="Chat with Doctors"
          description="Communicate directly with your healthcare providers"
          onBack={() => router.back()}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-medium text-lg">Profile Not Found</h3>
              <p className="text-sm text-muted-foreground">
                Unable to load your patient profile. Please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Chat with Doctors</h1>
          <p className="text-muted-foreground text-sm">
            Communicate directly with your healthcare providers
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Conversations List Sidebar */}
          <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0 h-full">
            <ChatErrorBoundary>
              <ChatLoadingOverlay
                isLoading={conversationsLoading}
                loadingText="Loading conversations..."
              >
                <DoctorConversationList
                  conversations={conversations}
                  selectedDoctorId={selectedDoctorId}
                  onConversationSelect={selectDoctor}
                  className="flex-1"
                  isLoading={conversationsLoading}
                />
              </ChatLoadingOverlay>
            </ChatErrorBoundary>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0 h-full">
            {selectedDoctorId && selectedDoctor && patientProfile ? (
              <ChatErrorBoundary>
                <DoctorChatInterface
                  doctorId={selectedDoctorId}
                  patientId={patientProfile._id}
                  doctorName={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  onClose={clearSelection}
                />
              </ChatErrorBoundary>
            ) : (
              <div className="h-full flex items-center justify-center">
                <ChatEmptyState
                  icon={MessageCircle}
                  title="Select a Doctor"
                  description="Choose a doctor from the list to start chatting"
                  iconSize="lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatErrorBoundary>
  );
};

export default PatientChat;
