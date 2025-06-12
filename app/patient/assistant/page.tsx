"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  Bot,
  Loader2,
  MessageCircle,
  Sparkles,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Brain,
  Activity,
  History,
  Plus,
  Trash2,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface RelevantDocument {
  id: string;
  event_type: string;
  content_preview: string;
  similarity_score: number;
  created_at: string;
  metadata: any;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  contextUsed?: boolean;
  relevantDocuments?: RelevantDocument[];
  relevantDocumentsCount?: number;
  processingTime?: number;
}

// Skeleton Loading Component
function AssistantSkeleton() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0 h-full">
            {/* Chat History Skeleton */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <div className="p-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-2 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features Skeleton */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="h-3 w-3 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface Skeleton */}
          <div className="lg:col-span-3 min-h-0 h-full">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col p-0">
                {/* Messages Skeleton */}
                <div className="flex-1 min-h-0 p-4">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
                        <div className="max-w-[80%] space-y-2">
                          <Skeleton className="h-16 w-full rounded-lg" />
                          {i % 2 === 0 && <Skeleton className="h-3 w-24" />}
                        </div>
                        {i % 2 === 1 && <Skeleton className="w-8 h-8 rounded-full" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Skeleton */}
                <div className="border-t p-4 flex-shrink-0">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="flex-1 h-10" />
                      <Skeleton className="h-10 w-10" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Profile Completion Component (Inside Dashboard Layout)
function ProfileCompletionContent({ patientProfile }: { patientProfile: any }) {
  // Define required fields for profile completion (matching actual schema)
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'primaryPhone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'addressLine1', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zipCode', label: 'Zip Code' },
    { key: 'emergencyContactName', label: 'Emergency Contact Name' },
    { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
  ];

  const completedRequired = useMemo(() => {
    if (!patientProfile) return [];
    return requiredFields.filter(field => {
      const value = patientProfile[field.key];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [patientProfile, requiredFields]);

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Access AI Assistant</CardTitle>
          <p className="text-muted-foreground">
            {!patientProfile
              ? "Set up your profile to start using the AI medical assistant."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {patientProfile && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completedRequired.length}/{requiredFields.length} fields</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${requiredCompletion}%` }}
                />
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {Math.round(requiredCompletion)}% Complete
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Required Information
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personal details and contact information</li>
                <li>• Complete address for medical records</li>
                <li>• Emergency contact information</li>
                <li>• Basic demographic information</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Sparkles className="h-4 w-4" />
                Unlock AI Features
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Get AI insights about your SOAP notes and medical records</li>
                <li>• Ask questions about your treatments and medications</li>
                <li>• Understand your care plans and health information</li>
                <li>• Receive personalized health guidance and recommendations</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your profile to unlock AI-powered medical assistance and personalized health insights.
            </p>

            <Link href="/patient/settings/profile" className="block">
              <Button className="w-full" size="lg">
                {!patientProfile ? "Get Started" : "Complete Profile"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to display relevant documents
function RelevantDocumentsSection({ documents }: { documents: RelevantDocument[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!documents || documents.length === 0) return null;

  return (
    <div className="mt-3 border-t pt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
      >
        <FileText className="h-3 w-3 mr-1" />
        {documents.length} relevant document{documents.length > 1 ? 's' : ''} found
        {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
      </Button>

      {isExpanded && (
        <div className="mt-2 space-y-1">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-background border rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-xs h-4">
                  {doc.event_type.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {doc.content_preview}
              </p>
              <div className="mt-1 text-xs text-muted-foreground">
                Similarity: {(doc.similarity_score * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PatientAssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<Id<"chatSessions"> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get chat sessions
  const chatSessions = useQuery(
    api.chatSessions.getUserSessions,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get current session messages
  const sessionMessages = useQuery(
    api.chatMessages.getSessionMessages,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  // Check if profile is complete (matching actual schema)
  const isProfileComplete = useMemo(() => {
    if (!patientProfile) return false;

    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'primaryPhone', 'email',
      'addressLine1', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone'
    ] as const;

    return requiredFields.every(field => {
      const value = patientProfile[field as keyof typeof patientProfile];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [patientProfile]);

  // Mutations
  const createSession = useMutation(api.chatSessions.createSession);
  const addMessage = useMutation(api.chatMessages.addMessage);
  const deleteSession = useMutation(api.chatSessions.deleteSession);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load session messages when session changes
  useEffect(() => {
    if (sessionMessages) {
      const formattedMessages: ChatMessage[] = sessionMessages.map(msg => ({
        id: msg._id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt),
        contextUsed: msg.contextUsed,
        relevantDocuments: msg.relevantDocuments,
        relevantDocumentsCount: msg.relevantDocumentsCount,
        processingTime: msg.processingTime
      }));
      setMessages(formattedMessages);
    } else if (!currentSessionId && patientProfile) {
      // Show welcome message when no session is selected
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: `Hello ${patientProfile.firstName || "there"}! I'm your personal medical assistant. I can help you understand your SOAP notes, track shared information with doctors, monitor prescriptions, and manage appointments. What would you like to know?`,
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [sessionMessages, currentSessionId, patientProfile]);

  // Auto-select first session if available
  useEffect(() => {
    if (chatSessions && chatSessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(chatSessions[0]._id);
    }
  }, [chatSessions, currentSessionId]);

  // Chat session handlers
  const handleNewChat = async () => {
    if (!session?.user?.id || !patientProfile) return;

    try {
      const sessionId = await createSession({
        userId: session.user.id as any,
        userType: "patient",
        patientId: patientProfile._id,
        title: `Chat ${new Date().toLocaleDateString()}`,
      });

      setCurrentSessionId(sessionId);
      setMessages([]);
      toast.success("New chat session created");
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create new chat session");
    }
  };

  const handleSelectSession = (sessionId: Id<"chatSessions">) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId: Id<"chatSessions">) => {
    try {
      await deleteSession({ sessionId });
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      toast.success("Chat session deleted");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete chat session");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !patientProfile || !session?.user?.id) return;

    // Create new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        sessionId = await createSession({
          userId: session.user.id as any,
          userType: "patient",
          patientId: patientProfile._id,
          title: inputMessage.trim().slice(0, 50) + (inputMessage.length > 50 ? "..." : ""),
        });
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error("Failed to create session:", error);
        toast.error("Failed to create chat session");
        return;
      }
    }

    const currentMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add user message to database
      await addMessage({
        sessionId,
        userId: session.user.id as any,
        content: currentMessage,
        sender: "user",
      });

      // Call AI API
      const response = await fetch("/api/patient/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          patient_id: patientProfile._id
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success && result.data) {
        // Add assistant message to database
        await addMessage({
          sessionId,
          userId: session.user.id as any,
          content: result.data.message || "I received your message but couldn't generate a proper response.",
          sender: "assistant",
          contextUsed: result.data.context_used || false,
          relevantDocuments: result.data.relevant_documents || [],
          relevantDocumentsCount: result.data.relevant_documents_count || 0,
          processingTime: result.data.processing_time
        });
      } else {
        throw new Error(result.error || "Failed to get response from assistant");
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to send message: ${errorMessage}`);

      // Add error message to database
      if (sessionId) {
        try {
          await addMessage({
            sessionId,
            userId: session.user.id as any,
            content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. If the problem persists, please contact support.",
            sender: "assistant",
          });
        } catch (dbError) {
          console.error("Failed to save error message:", dbError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <AssistantSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent patientProfile={patientProfile} />
      ) : (
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
            {/* Assistant Info Sidebar */}
            <div className="lg:col-span-1 flex flex-col space-y-4 min-h-0 h-full">

            {/* Chat History */}
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Chat History
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleNewChat}
                    disabled={isLoading}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {chatSessions?.map((session) => (
                      <div
                        key={session._id}
                        className={cn(
                          "p-2 rounded-md cursor-pointer transition-colors text-xs group relative",
                          currentSessionId === session._id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                        onClick={() => handleSelectSession(session._id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {session.title}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              {session.messageCount} msg • {new Date(session.lastMessageAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session._id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {(!chatSessions || chatSessions.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No chat history yet</p>
                        <p className="mt-1 opacity-75">Start a conversation to see your chat history</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Assistant Features */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Assistant Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SOAP Analysis</p>
                    <p className="text-muted-foreground">Understand your medical notes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Activity className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Treatment Tracking</p>
                    <p className="text-muted-foreground">Monitor your care plans</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Health Insights</p>
                    <p className="text-muted-foreground">Get personalized guidance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 min-h-0 h-full">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat with Your Assistant
                  <Badge variant="secondary" className="ml-auto">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-4">
                    {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === "assistant" && (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3 text-sm",
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-12"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.sender === "assistant" && (
                          <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.contextUsed && (
                                <Badge variant="outline" className="text-xs">
                                  Context: {message.relevantDocumentsCount || 0} docs
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Show relevant documents for assistant messages */}
                        {message.sender === "assistant" && message.relevantDocuments && message.relevantDocuments.length > 0 && (
                          <RelevantDocumentsSection documents={message.relevantDocuments} />
                        )}
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-medium">
                            {patientProfile?.firstName?.[0] || "P"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Analyzing your medical records...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me about your SOAP notes, care plans, symptoms, medications..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage("What is my latest care plan?")}
                      disabled={isLoading}
                      className="text-xs h-6"
                    >
                      Latest Care Plan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage("Show me my recent symptoms")}
                      disabled={isLoading}
                      className="text-xs h-6"
                    >
                      Recent Symptoms
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage("What medications am I taking?")}
                      disabled={isLoading}
                      className="text-xs h-6"
                    >
                      Current Medications
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}