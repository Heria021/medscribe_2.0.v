import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Users, Clock } from "lucide-react";

export const DoctorAssistantFeatures: React.FC = React.memo(() => {
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
            <p className="text-muted-foreground">Review and analyze patient SOAP notes</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Users className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Patient Insights</p>
            <p className="text-muted-foreground">Get insights about patient records</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-3 w-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">Clinical Support</p>
            <p className="text-muted-foreground">Medical documentation assistance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DoctorAssistantFeatures.displayName = "DoctorAssistantFeatures";
