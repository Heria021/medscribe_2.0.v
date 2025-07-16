"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ArrowLeft, Download, Share, Printer, Copy, FileText, Stethoscope, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SOAPNote {
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
  patientName?: string;
  patientId?: string;
}

export interface SOAPViewerConfig {
  showBackButton?: boolean;
  showActions?: boolean;
  showPatientInfo?: boolean;
  showMetadata?: boolean;
  allowPrint?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  allowCopy?: boolean;
  allowExportPDF?: boolean;
  backButtonText?: string;
  documentTitle?: string;
}

export interface SOAPViewerActions {
  onBack?: () => void;
  onDownload?: (note: SOAPNote) => void;
  onShare?: (note: SOAPNote) => void;
  onPrint?: (note: SOAPNote) => void;
  onCopy?: (note: SOAPNote) => void;
  onExportPDF?: (note: SOAPNote) => void;
}

export interface SOAPViewerProps {
  note: SOAPNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: SOAPViewerConfig;
  actions?: SOAPViewerActions;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: SOAPViewerConfig = {
  showBackButton: true,
  showActions: true,
  showPatientInfo: false,
  showMetadata: true,
  allowPrint: true,
  allowDownload: true,
  allowShare: false,
  allowCopy: true,
  allowExportPDF: false,
  backButtonText: "Back",
  documentTitle: "SOAP Clinical Note",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Universal SOAPViewer Component
 *
 * A full-screen overlay component for viewing SOAP notes in a document-like format.
 * Supports both patient and doctor contexts with configurable features.
 *
 * Features:
 * - Full-screen overlay with backdrop
 * - Document-style layout with professional typography
 * - Configurable actions (print, download, share, copy)
 * - Responsive design
 * - Keyboard shortcuts (ESC to close)
 * - Accessibility compliant
 */
export const SOAPViewer = React.memo<SOAPViewerProps>(({
  note,
  open,
  onOpenChange,
  config = {},
  actions = {},
  className,
}) => {
  // Merge with default config
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Don't render if no note
  if (!note) return null;

  // --------------------------------
  // Event Handlers
  // --------------------------------

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onOpenChange]);

  // Format date utility
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --------------------------------
  // Action Handlers
  // --------------------------------

  const handlePrint = () => {
    if (actions.onPrint) {
      actions.onPrint(note);
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = generatePrintContent(note, finalConfig);
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleExportPDF = () => {
    if (actions.onExportPDF) {
      actions.onExportPDF(note);
    } else {
      console.log('PDF export functionality to be implemented');
    }
  };

  const handleCopy = async () => {
    if (actions.onCopy) {
      actions.onCopy(note);
    } else {
      const content = generateTextContent(note, finalConfig);
      try {
        await navigator.clipboard.writeText(content);
        console.log('SOAP note copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  // --------------------------------
  // Helper Functions
  // --------------------------------

  /**
   * Generates plain text content for clipboard copy
   */
  const generateTextContent = (note: SOAPNote, config: SOAPViewerConfig) => {
    return `SOAP Clinical Note
${config.showPatientInfo && note.patientName ? `Patient: ${note.patientName}` : ''}
Generated on ${formatDate(note.createdAt)}

SUBJECTIVE:
${note.subjective}

OBJECTIVE:
${note.objective}

ASSESSMENT:
${note.assessment}

PLAN:
${note.plan}

${note.recommendations && note.recommendations.length > 0 ? `RECOMMENDATIONS:\n${note.recommendations.map(rec => `• ${rec}`).join('\n')}\n\n` : ''}${config.showMetadata ? `${note.qualityScore ? `Quality Score: ${note.qualityScore}%\n` : ''}${note.processingTime ? `Processing Time: ${note.processingTime}\n` : ''}Document ID: ${note._id.slice(-8)}` : ''}`;
  };

  /**
   * Generates HTML content for printing with professional styling
   */
  const generatePrintContent = (note: SOAPNote, config: SOAPViewerConfig) => {
    const currentYear = new Date().getFullYear();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.documentTitle} - ${note.patientName || 'Patient'}</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: 'Arial', 'Helvetica', sans-serif;
              line-height: 1.6;
              margin: 0;
              color: #111827;
              background: white;
            }
            .page {
              width: 21cm;
              min-height: 29.7cm;
              padding: 0;
              margin: 0 auto;
              background: white;
            }
            .document-header {
              padding: 2cm 1.5cm 1.5cm;
              border-bottom: 1px solid #e5e7eb;
              background: linear-gradient(to right, #f9fafb, #f3f4f6, #f9fafb);
            }
            .branding {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2cm;
            }
            .logo-container {
              display: flex;
              align-items: center;
            }
            .logo {
              width: 40px;
              height: 40px;
              background: #111827;
              color: white;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              margin-right: 12px;
            }
            .logo-text {
              display: flex;
              flex-direction: column;
            }
            .logo-title {
              font-weight: bold;
              font-size: 16px;
            }
            .logo-subtitle {
              font-size: 12px;
              color: #6b7280;
            }
            .document-id {
              font-size: 12px;
              color: #6b7280;
              text-align: right;
            }
            .document-title {
              text-align: center;
              margin-bottom: 1cm;
            }
            .document-title h1 {
              font-size: 28px;
              margin-bottom: 16px;
            }
            .patient-info {
              text-align: center;
              margin-bottom: 16px;
              font-size: 16px;
              padding: 8px;
              border: 1px solid #e5e7eb;
              display: inline-block;
              border-radius: 4px;
            }
            .document-date {
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            .document-content {
              padding: 1.5cm;
            }
            .section {
              margin-bottom: 1.5cm;
            }
            .section-title {
              font-weight: bold;
              font-size: 18px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            .section-content {
              white-space: pre-wrap;
              padding-left: 16px;
              border-left: 4px solid #f3f4f6;
            }
            .recommendations-list {
              list-style-type: none;
              padding-left: 16px;
              border-left: 4px solid #f3f4f6;
            }
            .recommendation-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            .recommendation-bullet {
              margin-right: 8px;
              font-weight: bold;
            }
            .document-footer {
              margin-top: 2cm;
              padding-top: 1cm;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            }
            .compliance-badges {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 12px;
              margin-bottom: 1cm;
            }
            .badge {
              font-size: 11px;
              padding: 4px 8px;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              color: #6b7280;
            }
            .metadata {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 16px;
              margin-bottom: 16px;
              font-size: 12px;
              color: #6b7280;
            }
            .metadata-item {
              display: flex;
              align-items: center;
            }
            .metadata-dot {
              width: 6px;
              height: 6px;
              background-color: #111827;
              border-radius: 50%;
              margin-right: 6px;
            }
            .copyright {
              font-size: 11px;
              color: #9ca3af;
              margin-top: 8px;
            }
            @media print {
              body { margin: 0; background: none; }
              .page { width: auto; min-height: auto; margin: 0; box-shadow: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="document-header">
              <div class="branding">
                <div class="logo-container">
                  <div class="logo">M</div>
                  <div class="logo-text">
                    <div class="logo-title">MedScribe</div>
                    <div class="logo-subtitle">v2.0 Clinical Platform</div>
                  </div>
                </div>
                <div class="document-id">
                  <div>HIPAA Compliant</div>
                  <div>Document ID: ${note._id.slice(-8)}</div>
                </div>
              </div>

              <div class="document-title">
                <h1>${config.documentTitle}</h1>
                ${config.showPatientInfo && note.patientName ?
                  `<div class="patient-info">Patient: ${note.patientName}</div>` : ''}
                <div class="document-date">Generated on ${formatDate(note.createdAt)}</div>
              </div>
            </div>

            <div class="document-content">
              <div class="section">
                <div class="section-title">Subjective</div>
                <div class="section-content">${note.subjective}</div>
              </div>

              <div class="section">
                <div class="section-title">Objective</div>
                <div class="section-content">${note.objective}</div>
              </div>

              <div class="section">
                <div class="section-title">Assessment</div>
                <div class="section-content">${note.assessment}</div>
              </div>

              <div class="section">
                <div class="section-title">Plan</div>
                <div class="section-content">${note.plan}</div>
              </div>

              ${note.recommendations && note.recommendations.length > 0 ? `
                <div class="section">
                  <div class="section-title">Recommendations</div>
                  <ul class="recommendations-list">
                    ${note.recommendations.map(rec => `
                      <li class="recommendation-item">
                        <span class="recommendation-bullet">•</span>
                        <span>${rec}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}

              ${config.showMetadata ? `
                <div class="document-footer">
                  <div class="compliance-badges">
                    <span class="badge">HIPAA Compliant</span>
                    <span class="badge">SOC 2 Type II</span>
                    <span class="badge">ISO 27001</span>
                    <span class="badge">GDPR Compliant</span>
                    <span class="badge">FDA Guidelines</span>
                  </div>

                  <div class="metadata">
                    ${note.qualityScore ? `
                      <div class="metadata-item">
                        <div class="metadata-dot"></div>
                        <span>Quality Score: ${note.qualityScore}%</span>
                      </div>
                    ` : ''}
                    ${note.processingTime ? `
                      <div class="metadata-item">
                        <div class="metadata-dot"></div>
                        <span>Processing Time: ${note.processingTime}</span>
                      </div>
                    ` : ''}
                  </div>

                  <div>This document was generated automatically by MedScribe AI Clinical Platform</div>
                  <div class="copyright">© ${currentYear} MedScribe. All rights reserved.</div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // --------------------------------
  // Render
  // --------------------------------

  // If not open, don't render anything
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col",
        "animate-in fade-in-0 duration-300",
        "bg-background",
        className
      )}
      aria-describedby="soap-note-document"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
        onClick={() => onOpenChange(false)}
      />



      {/* Professional Header with navigation, title and actions */}
      {(finalConfig.showBackButton || finalConfig.showActions) && (
        <div className="flex-shrink-0 border-b bg-card px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <div className="flex-shrink-0">
              {finalConfig.showBackButton && actions.onBack && (
                <Button
                  variant="ghost"
                  onClick={actions.onBack}
                  className="flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{finalConfig.backButtonText}</span>
                </Button>
              )}
            </div>

            {/* Center - Document title */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {finalConfig.documentTitle}
                  {finalConfig.showPatientInfo && note.patientName && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      - {note.patientName}
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {/* Right side - Action buttons */}
            {finalConfig.showActions && (
              <div className="flex items-center gap-1 sm:gap-2">
                {finalConfig.allowShare && actions.onShare && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onShare!(note)}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Share"
                  >
                    <Share className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                )}

                {finalConfig.allowDownload && actions.onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onDownload!(note)}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                )}

                {finalConfig.allowPrint && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrint}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                )}

                {finalConfig.allowCopy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                )}

                {finalConfig.allowExportPDF && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportPDF}
                    className="flex items-center gap-1 h-9 px-2 sm:px-3"
                    title="Export as PDF"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document content area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl bg-card shadow-2xl mx-auto my-8 border border-border rounded-lg overflow-hidden">
              {/* Professional Document Header */}
              <div className="bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-b border-border">
                <div className="p-8 md:p-12">
                  {/* Application Branding */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
                        <Stethoscope className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-foreground">MedScribe</span>
                        <span className="text-sm text-muted-foreground font-medium">v2.0 Clinical Platform</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        <Shield className="h-3 w-3 mr-1" />
                        HIPAA Compliant
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        Document ID: {note._id.slice(-8)}
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                      {finalConfig.documentTitle}
                    </h1>

                    {/* Patient information for doctor views */}
                    {finalConfig.showPatientInfo && note.patientName && (
                      <div className="mb-6">
                        <Badge variant="outline" className="text-base px-4 py-2">
                          <FileText className="h-4 w-4 mr-2" />
                          Patient: {note.patientName}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Generated on {formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-8 md:p-12 bg-card">
                {/* SOAP content sections with professional typography */}
                <div className="space-y-12">
                  {/* Subjective Section */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider border-b-2 border-primary/20 pb-3 mb-6">
                      Subjective
                    </h2>
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base pl-4 border-l-4 border-muted">
                      {note.subjective}
                    </div>
                  </div>

                  {/* Objective Section */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider border-b-2 border-primary/20 pb-3 mb-6">
                      Objective
                    </h2>
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base pl-4 border-l-4 border-muted">
                      {note.objective}
                    </div>
                  </div>

                  {/* Assessment Section */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider border-b-2 border-primary/20 pb-3 mb-6">
                      Assessment
                    </h2>
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base pl-4 border-l-4 border-muted">
                      {note.assessment}
                    </div>
                  </div>

                  {/* Plan Section */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider border-b-2 border-primary/20 pb-3 mb-6">
                      Plan
                    </h2>
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base pl-4 border-l-4 border-muted">
                      {note.plan}
                    </div>
                  </div>

                  {/* Recommendations if available */}
                  {note.recommendations && note.recommendations.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider border-b-2 border-primary/20 pb-3 mb-6">
                        Recommendations
                      </h2>
                      <ul className="space-y-3 pl-4 border-l-4 border-muted">
                        {note.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-foreground leading-relaxed text-base flex items-start gap-3">
                            <span className="text-primary font-bold mt-1">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Document footer with metadata and compliance indicators */}
                <div className="mt-16 pt-8 border-t border-border">
                  {/* Compliance badges */}
                  <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                    {[
                      { name: "HIPAA Compliant", icon: <Shield className="h-3 w-3" /> },
                      { name: "SOC 2 Type II", icon: <Shield className="h-3 w-3" /> },
                      { name: "ISO 27001", icon: <Shield className="h-3 w-3" /> },
                      { name: "GDPR Compliant", icon: <Shield className="h-3 w-3" /> },
                      { name: "FDA Guidelines", icon: <Shield className="h-3 w-3" /> }
                    ].map((badge, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs">
                        {badge.icon}
                        <span>{badge.name}</span>
                      </Badge>
                    ))}
                  </div>

                  {/* Metadata section */}
                  {finalConfig.showMetadata && (
                    <div className="text-center">
                      <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground flex-wrap">
                        {note.qualityScore && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <span className="font-medium">Quality Score: {note.qualityScore}%</span>
                          </div>
                        )}
                        {note.processingTime && (
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <span className="font-medium">Processing Time: {note.processingTime}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 text-xs text-muted-foreground">
                        This document was generated automatically by MedScribe AI Clinical Platform
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground/70">
                        © {new Date().getFullYear()} MedScribe. All rights reserved.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

SOAPViewer.displayName = "SOAPViewer";

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export interface UseSOAPViewerReturn {
  selectedNote: SOAPNote | null;
  isOpen: boolean;
  openViewer: (note: SOAPNote) => void;
  closeViewer: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * Custom hook for managing SOAP Viewer state
 * Provides clean interface for showing/hiding the viewer
 */
export function useSOAPViewer(): UseSOAPViewerReturn {
  const [selectedNote, setSelectedNote] = React.useState<SOAPNote | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openViewer = React.useCallback((note: SOAPNote) => {
    setSelectedNote(note);
    setIsOpen(true);
  }, []);

  const closeViewer = React.useCallback(() => {
    setIsOpen(false);
    setSelectedNote(null);
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    if (open) {
      setIsOpen(true);
    } else {
      closeViewer();
    }
  }, [closeViewer]);

  return {
    selectedNote,
    isOpen,
    openViewer,
    closeViewer,
    setOpen,
  };
}