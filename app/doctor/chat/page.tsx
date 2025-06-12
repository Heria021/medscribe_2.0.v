"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  User,
  ArrowLeft,
  Clock
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DoctorPatientChat } from "@/components/doctor/doctor-patient-chat";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export default function DoctorChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPatientId, setSelectedPatientId] = useState<Id<"patients"> | null>(null);
  const [showChat, setShowChat] = useState(false);

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

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get doctor conversations
  const conversations = useQuery(
    api.doctorPatientConversations.getDoctorConversations,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  const selectedPatient = conversations?.find(conv => conv.patientId === selectedPatientId)?.patient;

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </DashboardLayout>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <h1 className="text-lg font-semibold">Patient Chat</h1>
                <p className="text-sm text-muted-foreground">
                  Communicate directly with your patients
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <div className={cn(
            "h-full grid gap-4",
            showChat && selectedPatientId 
              ? "grid-cols-1 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {/* Conversations List */}
            <div className={cn(
              "flex flex-col min-h-0",
              showChat && selectedPatientId ? "lg:col-span-1" : "lg:col-span-1"
            )}>
              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Your Patients
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      {!conversations || conversations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                          <h3 className="font-medium mb-2">No Conversations</h3>
                          <p className="text-sm text-muted-foreground">
                            You don't have any active conversations with patients yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {conversations.map((conversation) => (
                            <div
                              key={conversation._id}
                              className={cn(
                                "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                                selectedPatientId === conversation.patientId
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              )}
                              onClick={() => {
                                setSelectedPatientId(conversation.patientId);
                                setShowChat(true);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    <User className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm truncate">
                                      {conversation.patient?.firstName} {conversation.patient?.lastName}
                                    </h4>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(conversation.lastMessageAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    MRN: {conversation.patient?.mrn}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <Badge variant="outline" className="text-xs h-5">
                                      Active
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            {showChat && selectedPatientId && selectedPatient && doctorProfile && (
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <DoctorPatientChat
                  doctorId={doctorProfile._id}
                  patientId={selectedPatientId}
                  patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                  onClose={() => {
                    setShowChat(false);
                    setSelectedPatientId(null);
                  }}
                />
              </div>
            )}

            {/* Empty State for Chat */}
            {!showChat && (
              <div className="lg:col-span-2 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Select a Patient</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a patient from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
