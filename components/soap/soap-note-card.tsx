"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Plus,
  Star,
  Clock,
  Activity
} from "lucide-react";

interface SOAPNoteCardProps {
  soapNote: {
    _id: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    qualityScore?: number;
    recommendations?: string[];
    createdAt: number;
    updatedAt: number;
  };
  onAddTreatment: () => void;
}

export function SOAPNoteCard({ soapNote, onAddTreatment }: SOAPNoteCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQualityColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">SOAP Note</CardTitle>
              {soapNote.qualityScore && (
                <Badge className={getQualityColor(soapNote.qualityScore)}>
                  <Star className="h-3 w-3 mr-1" />
                  {soapNote.qualityScore}%
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              {formatDate(soapNote.createdAt)}
            </CardDescription>
          </div>
          <Button onClick={onAddTreatment} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Treatment
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SOAP Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-blue-700">Subjective</h4>
            <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              {truncateText(soapNote.subjective)}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-green-700">Objective</h4>
            <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-md">
              {truncateText(soapNote.objective)}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-orange-700">Assessment</h4>
            <p className="text-sm text-muted-foreground bg-orange-50 p-3 rounded-md">
              {truncateText(soapNote.assessment)}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2 text-purple-700">Plan</h4>
            <p className="text-sm text-muted-foreground bg-purple-50 p-3 rounded-md">
              {truncateText(soapNote.plan)}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {soapNote.recommendations && soapNote.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              AI Recommendations
            </h4>
            <ul className="space-y-1">
              {soapNote.recommendations.slice(0, 3).map((recommendation, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  {recommendation}
                </li>
              ))}
              {soapNote.recommendations.length > 3 && (
                <li className="text-sm text-muted-foreground italic">
                  +{soapNote.recommendations.length - 3} more recommendations
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatDate(soapNote.updatedAt)}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onAddTreatment}>
            <Plus className="h-4 w-4 mr-1" />
            Create Treatment Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
