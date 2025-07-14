"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePatientAuth } from "@/hooks/use-patient-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Hooks
import { usePatientProfile, useDoctorConversations } from "./hooks";

// Components
import {
  ChatPageHeader,
  ChatEmptyState,
  DoctorConversationList,
  DoctorChatInterface,
  ChatErrorBoundary,
} from "./components";

// Individual skeleton components
const DoctorConversationListSkeleton = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
      </div>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 p-0">
      <div className="p-4 space-y-2 h-full overflow-y-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12 flex-shrink-0" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DoctorChatInterfaceSkeleton = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-3 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-48" />
      </div>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 flex flex-col p-0">
      {/* Messages Skeleton */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
              {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
              <div className="max-w-[80%] space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-3 w-24" />
              </div>
              {i % 2 === 1 && <Skeleton className="w-8 h-8 rounded-full" />}
            </div>
          ))}
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="border-t border-border p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </CardContent>
  </Card>
);

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



  // Redirect if not authenticated
  if (authLoading || !isAuthenticated) {
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
          {/* Conversations List Sidebar - Fixed Height */}
          <div className="lg:col-span-1 flex flex-col min-h-0 h-full">
            <ChatErrorBoundary>
              {conversationsLoading || profileLoading ? (
                <DoctorConversationListSkeleton />
              ) : (
                <DoctorConversationList
                  conversations={conversations}
                  selectedDoctorId={selectedDoctorId}
                  onConversationSelect={selectDoctor}
                  className="h-full"
                  isLoading={conversationsLoading}
                />
              )}
            </ChatErrorBoundary>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0 h-full">
            {conversationsLoading || profileLoading ? (
              <DoctorChatInterfaceSkeleton />
            ) : selectedDoctorId && selectedDoctor && patientProfile ? (
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
