import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Plus, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionListProps } from "../types";

export const SessionList: React.FC<SessionListProps> = React.memo(({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
  isLoading
}) => {
  const handleSessionClick = useCallback((sessionId: string) => {
    onSelectSession(sessionId as any);
  }, [onSelectSession]);

  const handleDeleteClick = useCallback((e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId as any);
  }, [onDeleteSession]);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <History className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Chat History</h3>
              <p className="text-xs text-muted-foreground">Your conversation sessions</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={onNewSession}
            disabled={isLoading}
          >
            <Plus className="h-3 w-3 mr-1" />
            New Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {sessions?.map((session) => (
              <div
                key={session._id}
                className={cn(
                  "p-2 rounded-md cursor-pointer transition-colors text-xs group relative",
                  currentSessionId === session._id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleSessionClick(session._id)}
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
                    onClick={(e) => handleDeleteClick(e, session._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {(!sessions || sessions.length === 0) && (
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
  );
});

SessionList.displayName = "SessionList";
