import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { DoctorMessageList } from "./DoctorMessageList";
import { DoctorChatInput } from "./DoctorChatInput";
import { DoctorChatInterfaceProps } from "../types";
import { useOptimizedDoctorChat, usePatientProfile } from "../hooks";
import { useSession } from "next-auth/react";

export const DoctorChatInterface: React.FC<DoctorChatInterfaceProps> = React.memo(({
  doctorId,
  patientId,
  doctorName,
  onClose
}) => {
  const { data: session } = useSession();
  const { profile: patientProfile } = usePatientProfile();
  
  const {
    messages,
    inputMessage,
    isLoading,
    setInputMessage,
    sendMessage,
    handleKeyPress
  } = useOptimizedDoctorChat({
    doctorId,
    patientProfile
  });

  const patientName = patientProfile ? 
    `${patientProfile.firstName || ''} ${patientProfile.lastName || ''}`.trim() || 'You' 
    : 'You';

  return (
    <Card className="h-full flex flex-col bg-background border-border">
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="relative px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm"></div>
                <div className="relative p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                  Chat with Dr. {doctorName}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct messaging
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 flex flex-col p-0">
        <DoctorMessageList
          messages={messages}
          isLoading={isLoading}
          doctorName={doctorName}
          patientName={patientName}
          currentUserId={session?.user?.id}
        />
        
        <DoctorChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          placeholder={`Message Dr. ${doctorName}...`}
        />
      </CardContent>
    </Card>
  );
});

DoctorChatInterface.displayName = "DoctorChatInterface";
