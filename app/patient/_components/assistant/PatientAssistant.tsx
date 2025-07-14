"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Hooks
import { usePatientProfile, useChatSessions, useOptimizedChat } from "./hooks";

// Components
import {
  SessionList,
  AssistantFeatures,
  ChatInterface,
  ErrorBoundary,
} from "./components";



// Individual skeleton components
const SessionListSkeleton = () => (
  <Card className="h-full flex flex-col overflow-hidden bg-background border-border">
    <CardHeader className="pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 bg-muted" />
        <Skeleton className="h-6 w-6 bg-muted" />
      </div>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
      <div className="p-3 space-y-2 h-full overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-2 space-y-1">
            <Skeleton className="h-3 w-full bg-muted" />
            <Skeleton className="h-3 w-2/3 bg-muted" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AssistantFeaturesSkeleton = () => (
  <Card className="flex-shrink-0 bg-background border-border">
    <CardHeader className="pb-3">
      <Skeleton className="h-4 w-32 bg-muted" />
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2">
          <Skeleton className="h-3 w-3 mt-0.5 bg-muted" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-20 bg-muted" />
            <Skeleton className="h-3 w-full bg-muted" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const ChatInterfaceSkeleton = () => (
  <Card className="h-full flex flex-col overflow-hidden bg-background border-border">
    <CardHeader className="pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48 bg-muted" />
        <Skeleton className="h-5 w-20 bg-muted" />
      </div>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
      <div className="flex-1 min-h-0 p-4 overflow-y-auto">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full bg-muted" />}
              <div className="max-w-[80%] space-y-2">
                <Skeleton className="h-16 w-full rounded-lg bg-muted" />
                {i % 2 === 0 && <Skeleton className="h-3 w-24 bg-muted" />}
              </div>
              {i % 2 === 1 && <Skeleton className="w-8 h-8 rounded-full bg-muted" />}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 border-t border-border">
        <Skeleton className="h-10 w-full rounded-lg bg-muted" />
      </div>
    </CardContent>
  </Card>
);

const PatientAssistant: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Custom hooks for data and state management
  const { profile: patientProfile, isLoading: profileLoading } = usePatientProfile();
  const {
    sessions: chatSessions,
    currentSessionId,
    isLoading: sessionsLoading,
    createNewSession,
    selectSession,
    deleteSession,
  } = useChatSessions(patientProfile);

  const {
    messages,
    inputMessage,
    isLoading: chatLoading,
    setInputMessage,
    sendMessage,
    handleKeyPress,
  } = useOptimizedChat({
    currentSessionId,
    patientProfile,
    onSessionCreated: selectSession,
  });

  // Authentication and authorization
  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Redirect if not authenticated or wrong role
  if (status === "loading" || !session || session.user.role !== "patient") {
    return null;
  }

  // Show main assistant interface
  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight">AI Medical Assistant</h1>
          <p className="text-muted-foreground text-sm">
            Get AI-powered insights about your medical records, SOAP notes, and health information
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Sidebar - Full Height */}
          <div className="lg:col-span-1 flex flex-col min-h-0 h-full gap-4">
            {/* Session List - Takes most of the space */}
            <div className="flex-1 min-h-0">
              <ErrorBoundary>
                {sessionsLoading || profileLoading ? (
                  <SessionListSkeleton />
                ) : (
                  <SessionList
                    sessions={chatSessions}
                    currentSessionId={currentSessionId}
                    onSelectSession={selectSession}
                    onDeleteSession={deleteSession}
                    onNewSession={createNewSession}
                    isLoading={sessionsLoading}
                  />
                )}
              </ErrorBoundary>
            </div>

            {/* Assistant Features - Compact at bottom */}
            <div className="flex-shrink-0">
              <ErrorBoundary>
                {profileLoading ? (
                  <AssistantFeaturesSkeleton />
                ) : (
                  <AssistantFeatures />
                )}
              </ErrorBoundary>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0 h-full">
            <ErrorBoundary>
              {profileLoading ? (
                <ChatInterfaceSkeleton />
              ) : (
                <ChatInterface
                  messages={messages}
                  inputMessage={inputMessage}
                  isLoading={chatLoading}
                  patientProfile={patientProfile}
                  onInputChange={setInputMessage}
                  onSendMessage={sendMessage}
                  onKeyPress={handleKeyPress}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PatientAssistant;
