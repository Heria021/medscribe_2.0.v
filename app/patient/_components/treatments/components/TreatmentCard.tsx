import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Pause, 
  Pill, 
  Target 
} from "lucide-react";
import type { TreatmentCardProps } from "../types";

/**
 * Compact Treatment Card Component for Sidebar
 * Displays treatment information in a compact, clickable format
 */
export const TreatmentCard = React.memo<TreatmentCardProps>(({
  treatment,
  variant = "default",
  isSelected = false,
  onClick,
  className = "",
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case "discontinued":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Pause className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "discontinued":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      } ${className}`}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate flex-1">{treatment.title}</h4>
          <Badge variant="outline" className={`${getStatusColor(treatment.status)} text-xs h-5 px-2`}>
            {getStatusIcon(treatment.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {treatment.diagnosis}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Pill className="h-3 w-3" />
              {treatment.medications?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {treatment.goals?.length || 0}
            </span>
          </div>
          <span className="text-xs">
            {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
});

TreatmentCard.displayName = "TreatmentCard";
