"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareSOAPDialog } from "./share-soap-dialog";
import {
  FileText,
  Download,
  Share,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SOAPNote {
  _id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  highlightedHtml?: string;
  qualityScore?: number;
  processingTime?: string;
  recommendations?: string[];
  googleDocUrl?: string;
  createdAt: number;
  updatedAt: number;
}

interface SOAPNotesDisplayProps {
  soapNote: SOAPNote;
  showActions?: boolean;
  compact?: boolean;
}

export function SOAPNotesDisplay({ 
  soapNote, 
  showActions = true, 
  compact = false 
}: SOAPNotesDisplayProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityBadge = (score?: number) => {
    if (!score) return null;
    
    if (score >= 90) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent ({score}%)</Badge>;
    } else if (score >= 80) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good ({score}%)</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Fair ({score}%)</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Review ({score}%)</Badge>;
    }
  };

  const handleDownload = () => {
    const content = `
SOAP NOTES
Generated on: ${formatDate(soapNote.createdAt)}
${soapNote.qualityScore ? `Quality Score: ${soapNote.qualityScore}%` : ''}
${soapNote.processingTime ? `Processing Time: ${soapNote.processingTime}` : ''}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}

${soapNote.recommendations && soapNote.recommendations.length > 0 ? `
RECOMMENDATIONS:
${soapNote.recommendations.map(rec => `• ${rec}`).join('\n')}
` : ''}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-notes-${new Date(soapNote.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <CardTitle className="text-base">SOAP Notes</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getQualityBadge(soapNote.qualityScore)}
              <Badge variant="outline" className="text-xs">
                {formatDate(soapNote.createdAt)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-1">Subjective</h4>
              <p className="text-muted-foreground line-clamp-2">
                {soapNote.subjective.substring(0, 100)}...
              </p>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-1">Assessment</h4>
              <p className="text-muted-foreground line-clamp-2">
                {soapNote.assessment.substring(0, 100)}...
              </p>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          )}
        </CardContent>

        {/* Share Dialog */}
        <ShareSOAPDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          soapNoteId={soapNote._id}
          onSuccess={() => {
            // Could add a success callback here
          }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle>SOAP Clinical Notes</CardTitle>
                <CardDescription>
                  Generated on {formatDate(soapNote.createdAt)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getQualityBadge(soapNote.qualityScore)}
              {soapNote.processingTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {soapNote.processingTime}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        {showActions && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              {soapNote.googleDocUrl && (
                <Button variant="outline" asChild>
                  <a href={soapNote.googleDocUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Google Docs
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* SOAP Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjective */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
              Subjective
            </CardTitle>
            <CardDescription>Patient's reported symptoms and history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {soapNote.subjective}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Objective */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-700 rounded-full"></div>
              Objective
            </CardTitle>
            <CardDescription>Observable findings and measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {soapNote.objective}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-orange-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-700 rounded-full"></div>
              Assessment
            </CardTitle>
            <CardDescription>Clinical diagnosis and evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {soapNote.assessment}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-700 rounded-full"></div>
              Plan
            </CardTitle>
            <CardDescription>Treatment plan and next steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {soapNote.plan}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {soapNote.recommendations && soapNote.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Suggestions for improving clinical documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {soapNote.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Highlighted HTML */}
      {soapNote.highlightedHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced View</CardTitle>
            <CardDescription>
              AI-highlighted clinical content with key terms emphasized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: soapNote.highlightedHtml }}
            />
          </CardContent>
        </Card>
      )}

      {/* Share Dialog */}
      <ShareSOAPDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        soapNoteId={soapNote._id}
        onSuccess={() => {
          // Could add a success callback here
        }}
      />
    </div>
  );
}
