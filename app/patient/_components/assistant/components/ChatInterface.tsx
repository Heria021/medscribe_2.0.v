import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ChatMessage, PatientProfile } from "../types";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  patientProfile?: PatientProfile;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = React.memo(({
  messages,
  inputMessage,
  isLoading,
  patientProfile,
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
          patientProfile={patientProfile}
        />
        <ChatInput
          value={inputMessage}
          onChange={onInputChange}
          onSend={onSendMessage}
          onKeyPress={onKeyPress}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
});

ChatInterface.displayName = "ChatInterface";
