"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";
import {
  FileText,
  Star,
  Share,
  Clock,
  Eye,
  Download,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { SOAPNoteCardProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Optimized SOAP Note Card component with React.memo for performance
 * Generic and reusable with configurable props
 */
export const SOAPNoteCard = React.memo<SOAPNoteCardProps>(({
  note,
  sharedWith = [],
  timelineItems = [],
  onDownload,
  onShare,
  onView,
  formatDate,
  getQualityColor,
  compact = false,
  showActions = true,
  className,
}) => {
  // Default formatters if not provided
  const defaultFormatDate = (timestamp: number) => 
    new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const defaultGetQualityColor = (score?: number) => {
    if (!score) return "text-gray-500 bg-gray-50 border-gray-200";
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const dateFormatter = formatDate || defaultFormatDate;
  const qualityColorGetter = getQualityColor || defaultGetQualityColor;

  // Compact version for list views
  if (compact) {
    return (
      <Card className={cn(
        "hover:border-primary/50 transition-all duration-200 group",
        className
      )}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-1.5 bg-blue-500/10 rounded shrink-0">
                <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm text-foreground truncate">
                  SOAP Clinical Note
                </h3>
                <p className="text-xs text-muted-foreground">
                  {dateFormatter(note.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {note.qualityScore && (
                <Badge variant="outline" className={cn(
                  "text-xs h-5",
                  qualityColorGetter(note.qualityScore)
                )}>
                  <Star className="h-3 w-3 mr-1" />
                  {note.qualityScore}%
                </Badge>
              )}
              {sharedWith.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5">
                  <Share className="h-3 w-3 mr-1" />
                  {sharedWith.length}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version
  return (
    <Card className={cn(
      "hover:border-primary/50 transition-colors group",
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/10 rounded">
                <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground">
                  SOAP Clinical Note
                </h3>
                <p className="text-xs text-muted-foreground">
                  {dateFormatter(note.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {note.qualityScore && (
                <Badge variant="outline" className={cn(
                  "text-xs h-5",
                  qualityColorGetter(note.qualityScore)
                )}>
                  <Star className="h-3 w-3 mr-1" />
                  {note.qualityScore}%
                </Badge>
              )}
              {sharedWith.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5">
                  <Share className="h-3 w-3 mr-1" />
                  {sharedWith.length}
                </Badge>
              )}
            </div>
          </div>

          {/* Content Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                Subjective
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {note.subjective.length > 100
                  ? note.subjective.substring(0, 100) + "..."
                  : note.subjective}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">
                Assessment
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {note.assessment.length > 100
                  ? note.assessment.substring(0, 100) + "..."
                  : note.assessment}
              </p>
            </div>
          </div>

          {/* Processing Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{note.processingTime || 'N/A'}</span>
            </div>
            {note.qualityScore && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{note.qualityScore}%</span>
              </div>
            )}
          </div>

          {/* Timeline for Referrals and Sharing */}
          {timelineItems.length > 0 && (
            <div className="pt-2 border-t">
              <Timeline items={timelineItems} />
            </div>
          )}

          {/* Show sharing info if no timeline but note is shared */}
          {timelineItems.length === 0 && sharedWith.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Share className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Shared with {sharedWith.length} doctor{sharedWith.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sharedWith.slice(0, 2).map((shared) => (
                  <div key={shared._id} className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1">
                    <div className="h-4 w-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {shared.doctor?.firstName?.[0] || 'D'}{shared.doctor?.lastName?.[0] || 'R'}
                      </span>
                    </div>
                    <span className="text-xs text-foreground">
                      Dr. {shared.doctor?.firstName || 'Unknown'} {shared.doctor?.lastName || 'Doctor'}
                    </span>
                    {shared.isRead ? (
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Clock className="h-3 w-3 text-orange-600" />
                    )}
                  </div>
                ))}
                {sharedWith.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{sharedWith.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer with Actions */}
      {showActions && (
        <CardFooter className="px-4 py-2 bg-muted/5 border-t">
          <div className="flex items-center justify-end w-full gap-1">
            {onView ? (
              <Button
                variant="default"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() => onView(note._id)}
              >
                <Eye className="h-3 w-3" />
                View
              </Button>
            ) : (
              <Link href={`/patient/soap/view/${note._id}`}>
                <Button variant="default" size="sm" className="gap-1 h-7 text-xs">
                  <Eye className="h-3 w-3" />
                  View
                </Button>
              </Link>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() => onDownload(note)}
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() => onShare(note._id)}
              >
                <Share className="h-3 w-3" />
                Share
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
});

SOAPNoteCard.displayName = "SOAPNoteCard";
