"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  Send,
  User,
  Loader2,
  X,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface ChatMessage {
  _id: string;
  content: string;
  senderId: string;
  senderType: "doctor" | "patient";
  createdAt: number;
  isRead: boolean;
}

interface DoctorPatientChatProps {
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  patientName: string;
  onClose?: () => void;
}

export function DoctorPatientChat({
  doctorId,
  patientId,
  patientName,
  onClose
}: DoctorPatientChatProps) {
  const { data: session } = useSession();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get doctor profile to get user ID
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as Id<"users"> } : "skip"
  );

  // Get patient to get user ID
  const patient = useQuery(api.patients.getPatientById, { patientId });

  // Conversation mutations and queries
  const createOrGetConversation = useMutation(api.doctorPatientConversations.createOrGetConversation);
  const sendMessage = useMutation(api.doctorPatientConversations.sendMessage);
  const markAsRead = useMutation(api.doctorPatientConversations.markMessagesAsRead);

  // Get existing conversation
  const conversation = useQuery(
    api.doctorPatientConversations.getConversation,
    doctorProfile && patientId ? { doctorId, patientId } : "skip"
  );

  // Get messages for current conversation
  const conversationMessages = useQuery(
    api.doctorPatientConversations.getMessages,
    conversation ? { conversationId: conversation._id } : "skip"
  );

  const [currentConversationId, setCurrentConversationId] = useState<Id<"doctorPatientConversations"> | null>(null);

  // Initialize conversation
  useEffect(() => {
    if (conversation) {
      setCurrentConversationId(conversation._id);
      // Mark messages as read when opening chat
      markAsRead({
        conversationId: conversation._id,
        userId: session!.user.id as any,
      });
    } else if (session?.user?.id && doctorProfile && patient && doctorId && patientId) {
      // Create new conversation
      createOrGetConversation({
        doctorId,
        patientId,
        doctorUserId: session.user.id as any,
        patientUserId: patient.userId,
      }).then((conversationId) => {
        setCurrentConversationId(conversationId);
      }).catch((error) => {
        console.error("Failed to create conversation:", error);
        toast.error("Failed to initialize chat");
      });
    }
  }, [conversation, session, doctorProfile, patient, doctorId, patientId, createOrGetConversation, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentConversationId) return;

    const currentMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Send message
      await sendMessage({
        conversationId: currentConversationId,
        senderId: session!.user.id as any,
        senderType: "doctor",
        content: currentMessage,
      });

      toast.success("Message sent successfully");

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");

      // Re-add the message to input if it failed
      setInputMessage(currentMessage);
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

  const chatMessages: ChatMessage[] = conversationMessages?.map(msg => ({
    _id: msg._id,
    content: msg.content,
    senderId: msg.senderId,
    senderType: msg.senderType,
    createdAt: msg.createdAt,
    isRead: msg.isRead,
  })) || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">
              Chat with {patientName}
            </CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to start chatting with {patientName}.
                </p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message._id}
                  className={cn(
                    "flex gap-3",
                    message.senderType === "doctor" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.senderType === "patient" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.senderType === "doctor"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  {message.senderType === "doctor" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-600">
                        <Stethoscope className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
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
  );
}
