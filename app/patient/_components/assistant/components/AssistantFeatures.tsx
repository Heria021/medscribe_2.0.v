import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Activity, Calendar } from "lucide-react";

export const AssistantFeatures: React.FC = React.memo(() => {
  return (
    <Card className="flex-shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Assistant Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-start gap-2">
          <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">SOAP Analysis</p>
            <p className="text-muted-foreground">Understand your medical notes</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Activity className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Treatment Tracking</p>
            <p className="text-muted-foreground">Monitor your care plans</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Health Insights</p>
            <p className="text-muted-foreground">Get personalized guidance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AssistantFeatures.displayName = "AssistantFeatures";
