"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  Brain,
  FileText,
  Users,
  Clock,
  Bot,
  History,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

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

export default function DoctorAssistant() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<Id<"chatSessions"> | null>(null);

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
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

  // Mutations
  const createSession = useMutation(api.chatSessions.createSession);
  const addMessage = useMutation(api.chatMessages.addMessage);
  const deleteSession = useMutation(api.chatSessions.deleteSession);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

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
    } else if (!currentSessionId && doctorProfile) {
      // Show welcome message when no session is selected
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: `Hello Dr. ${doctorProfile.lastName || "Doctor"}! I'm your AI medical assistant. I can help you analyze patient records, review SOAP notes, provide clinical insights, and assist with medical documentation. What would you like to know?`,
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [sessionMessages, currentSessionId, doctorProfile]);

  // Auto-select first session if available
  useEffect(() => {
    if (chatSessions && chatSessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(chatSessions[0]._id);
    }
  }, [chatSessions, currentSessionId]);

  // Chat session handlers
  const handleNewChat = async () => {
    if (!session?.user?.id || !doctorProfile) return;

    try {
      const sessionId = await createSession({
        userId: session.user.id as any,
        userType: "doctor",
        doctorId: doctorProfile._id,
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
    if (!inputMessage.trim() || isLoading || !doctorProfile || !session?.user?.id) return;

    // Create new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      try {
        sessionId = await createSession({
          userId: session.user.id as any,
          userType: "doctor",
          doctorId: doctorProfile._id,
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
      const response = await fetch("/api/doctor/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          doctor_id: doctorProfile._id
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
      console.error("Error sending message:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to send message: ${errorMessage}`);

      // Add error message to database
      if (sessionId) {
        try {
          await addMessage({
            sessionId,
            userId: session.user.id as any,
            content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight">AI Medical Assistant</h1>
          <p className="text-muted-foreground text-sm">
            Get AI-powered insights about your patients, SOAP notes, and medical records
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Assistant Info Sidebar */}
          <div className="lg:col-span-1 flex flex-col space-y-4">

            {/* Chat History */}
            <Card className="flex-1 flex flex-col min-h-0">
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
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-1">
                    {chatSessions?.map((session) => (
                      <div
                        key={session._id}
                        className={cn(
                          "p-2 rounded-md cursor-pointer transition-colors text-xs group",
                          currentSessionId === session._id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                        onClick={() => handleSelectSession(session._id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate flex-1">
                            {session.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session._id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {session.messageCount} messages • {new Date(session.lastMessageAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}

                    {(!chatSessions || chatSessions.length === 0) && (
                      <div className="text-center py-4 text-muted-foreground text-xs">
                        No chat history yet
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
                    <p className="text-muted-foreground">Review and analyze patient SOAP notes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Patient Insights</p>
                    <p className="text-muted-foreground">Get insights about patient records</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Clinical Support</p>
                    <p className="text-muted-foreground">Medical documentation assistance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Chat Interface */}
          <Card className="lg:col-span-3 flex flex-col min-h-0">
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
            <CardContent className="flex-1 min-h-0 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0 p-4 scrollbar-hide">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.sender === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === "assistant" && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-primary-foreground font-medium">
                            {doctorProfile?.firstName?.[0] || "D"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me about patient records, SOAP notes, clinical insights..."
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}