import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">
              Chat with Dr. {doctorName}
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
