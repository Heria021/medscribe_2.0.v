import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

interface Doctor {
  _id: Id<"doctors">;
  firstName: string;
  lastName: string;
  primarySpecialty?: string;
}

interface Conversation {
  _id: Id<"doctorPatientConversations">;
  doctorId: Id<"doctors">;
  lastMessageAt: number;
  doctor?: Doctor;
}

interface DoctorConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: (doctorId: Id<"doctors">) => void;
  className?: string;
}

export function DoctorConversationItem({ 
  conversation, 
  isSelected, 
  onClick, 
  className = "" 
}: DoctorConversationItemProps) {
  return (
    <div
      className={cn(
        "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        className
      )}
      onClick={() => onClick(conversation.doctorId)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-green-100 text-green-600">
            <Stethoscope className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm truncate">
              Dr. {conversation.doctor?.firstName} {conversation.doctor?.lastName}
            </h4>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(conversation.lastMessageAt).toLocaleDateString()}
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.doctor?.primarySpecialty}
          </p>
          <div className="flex items-center justify-between mt-1">
            <Badge variant="outline" className="text-xs h-5">
              Active
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
