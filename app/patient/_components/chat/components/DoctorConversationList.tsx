import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorConversationListProps, DoctorConversation } from "../types";
import { DoctorConversationItem } from "../doctor-conversation-item";
import { ChatEmptyState } from "../chat-empty-state";

export const DoctorConversationList: React.FC<DoctorConversationListProps> = React.memo(({
  conversations,
  selectedDoctorId,
  onConversationSelect,
  className = "",
  isLoading = false
}) => {
  // Memoize sorted conversations to prevent unnecessary re-renders
  const sortedConversations = useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [conversations]);

  // Memoize the conversation select handler
  const handleConversationSelect = useCallback((doctorId: string) => {
    onConversationSelect(doctorId as any);
  }, [onConversationSelect]);

  // Memoize loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  ), []);

  // Memoize empty state
  const emptyState = useMemo(() => (
    <ChatEmptyState
      icon={MessageCircle}
      title="No Conversations"
      description="You don't have any active conversations with doctors yet."
    />
  ), []);

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
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
                    Your Doctors
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Active conversations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoading ? (
                loadingSkeleton
              ) : !sortedConversations || sortedConversations.length === 0 ? (
                emptyState
              ) : (
                <div className="space-y-2">
                  {sortedConversations.map((conversation) => (
                    <DoctorConversationItem
                      key={conversation._id}
                      conversation={conversation}
                      isSelected={selectedDoctorId === conversation.doctorId}
                      onClick={handleConversationSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

DoctorConversationList.displayName = "DoctorConversationList";
