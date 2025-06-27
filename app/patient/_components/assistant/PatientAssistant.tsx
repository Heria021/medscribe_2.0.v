"use client";

import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Hooks
import { usePatientProfile, useChatSessions, useOptimizedChat } from "./hooks";

// Components
import {
  AssistantSkeleton,
  SessionList,
  AssistantFeatures,
  ChatInterface,
  ErrorBoundary,
  LoadingOverlay,
} from "./components";

// Types
import { Id } from "@/convex/_generated/dataModel";

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

  // Memoize loading state
  const isLoading = useMemo(() => {
    return status === "loading" || (session?.user?.id && profileLoading);
  }, [status, session?.user?.id, profileLoading]);

  // Show loading skeleton while session or profile is loading
  if (isLoading) {
    return <AssistantSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
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
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0 h-full">
            <ErrorBoundary>
              <LoadingOverlay isLoading={sessionsLoading} loadingText="Loading chat history...">
                <SessionList
                  sessions={chatSessions}
                  currentSessionId={currentSessionId}
                  onSelectSession={selectSession}
                  onDeleteSession={deleteSession}
                  onNewSession={createNewSession}
                  isLoading={sessionsLoading}
                />
              </LoadingOverlay>
            </ErrorBoundary>

            <ErrorBoundary>
              <AssistantFeatures />
            </ErrorBoundary>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0 h-full">
            <ErrorBoundary>
              <ChatInterface
                messages={messages}
                inputMessage={inputMessage}
                isLoading={chatLoading}
                patientProfile={patientProfile}
                onInputChange={setInputMessage}
                onSendMessage={sendMessage}
                onKeyPress={handleKeyPress}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PatientAssistant;
