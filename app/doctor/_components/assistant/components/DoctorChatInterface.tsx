import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles } from "lucide-react";

// Reuse patient assistant components but with doctor-specific types
import { MessageList, ChatInput } from "@/app/patient/_components/assistant/components";
import { ChatMessage, DoctorProfile } from "../types";

interface DoctorChatInterfaceProps {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  doctorProfile?: DoctorProfile;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const DoctorChatInterface: React.FC<DoctorChatInterfaceProps> = React.memo(({
  messages,
  inputMessage,
  isLoading,
  doctorProfile,
  onInputChange,
  onSendMessage,
  onKeyPress
}) => {
  return (
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
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          patientProfile={doctorProfile as any} // Type compatibility - MessageList works with both
        />
        <ChatInput
          value={inputMessage}
          onChange={onInputChange}
          onSend={onSendMessage}
          onKeyPress={onKeyPress}
          isLoading={isLoading}
          placeholder="Ask me about patient records, SOAP notes, clinical insights..."
        />
      </CardContent>
    </Card>
  );
});

DoctorChatInterface.displayName = "DoctorChatInterface";
