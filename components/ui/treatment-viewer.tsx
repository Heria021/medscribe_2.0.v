"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  Download,
  Share,
  Printer,
  Copy,
  FileText,
  Activity,
  Shield,
  Clock,
  Brain,
  AlertTriangle,
  ShieldAlert,
  Pill,
  MapPin,
  User,
  Target,
  Calendar,
  Building,
  Phone,
  CheckCircle,
  XCircle,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MedicationDetails {
  name: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  ndc?: string;
  rxcui?: string;
  quantity: string;
  frequency: string;
  duration?: string;
  instructions: string;
  refills: number;
}

export interface PharmacyInfo {
  _id: string;
  name: string;
  chainName?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface DoctorInfo {
  _id: string;
  firstName: string;
  lastName: string;
  primarySpecialty?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
}

export interface PatientInfo {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface SOAPNoteInfo {
  _id: string;
  timestamp: number;
  data?: {
    session_id?: string;
    specialty_detection?: {
      specialty: string;
      confidence: number;
    };
    soap_notes?: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    quality_metrics?: {
      overall_score: number;
      completeness_score: number;
      accuracy_score: number;
    };
    safety_checks?: {
      red_flags: string[];
      contraindications: string[];
      drug_interactions: string[];
    };
  };
  status: string;
}

export interface TreatmentPlan {
  _id: string;
  title: string;
  diagnosis: string;
  plan: string;
  goals?: string[];
  status: "active" | "completed" | "discontinued";
  startDate: string;
  endDate?: string;
  createdAt: number;
  updatedAt: number;

  // Related data
  medicationDetails?: MedicationDetails[];
  pharmacy?: PharmacyInfo;
  doctor?: DoctorInfo;
  patient?: PatientInfo;
  soapNote?: SOAPNoteInfo;

  // Optional metadata
  patientName?: string;
  doctorName?: string;
}

export interface TreatmentViewerConfig {
  showBackButton?: boolean;
  showActions?: boolean;
  showPatientInfo?: boolean;
  showDoctorInfo?: boolean;
  showMetadata?: boolean;
  allowPrint?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  allowCopy?: boolean;
  allowExportPDF?: boolean;
  backButtonText?: string;
  documentTitle?: string;
}

export interface TreatmentViewerActions {
  onBack?: () => void;
  onDownload?: (treatment: TreatmentPlan) => void;
  onShare?: (treatment: TreatmentPlan) => void;
  onPrint?: (treatment: TreatmentPlan) => void;
  onCopy?: (treatment: TreatmentPlan) => void;
  onExportPDF?: (treatment: TreatmentPlan) => void;
}

export interface TreatmentViewerProps {
  treatment: TreatmentPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: TreatmentViewerConfig;
  actions?: TreatmentViewerActions;
  className?: string;
}

export interface UseTreatmentViewerReturn {
  selectedTreatment: TreatmentPlan | null;
  isOpen: boolean;
  openViewer: (treatment: TreatmentPlan) => void;
  closeViewer: () => void;
  setOpen: (open: boolean) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: TreatmentViewerConfig = {
  showBackButton: true,
  showActions: true,
  showPatientInfo: false,
  showDoctorInfo: true,
  showMetadata: true,
  allowPrint: true,
  allowDownload: true,
  allowShare: false,
  allowCopy: true,
  allowExportPDF: false,
  backButtonText: "Back",
  documentTitle: "Treatment Plan",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Treatment utility functions for data extraction and formatting
 */
export const TreatmentUtils = {
  formatDate: (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatShortDate: (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  getStatusColor: (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "discontinued":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  },

  getStatusIcon: (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "discontinued":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  },

  getDuration: (startDate: string, endDate?: string) => {
    if (!endDate) return "Ongoing";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  },

  hasEnhancedData: (treatment: TreatmentPlan) => {
    return !!(
      treatment.medicationDetails?.length ||
      treatment.pharmacy ||
      treatment.soapNote ||
      treatment.goals?.length
    );
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Universal TreatmentViewer Component
 *
 * A full-screen overlay component for viewing treatment plans in a document-like format.
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
export const TreatmentViewer = React.memo<TreatmentViewerProps>(({
  treatment,
  open,
  onOpenChange,
  config = {},
  actions = {},
  className,
}) => {
  // Merge with default config
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Action handlers
  const handlePrint = () => {
    const printContent = generatePrintContent(treatment, finalConfig);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleCopy = async () => {
    const textContent = generateTextContent(treatment, finalConfig);
    try {
      await navigator.clipboard.writeText(textContent);
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy treatment plan:', err);
    }
  };

  const handleExportPDF = () => {
    if (actions.onExportPDF) {
      actions.onExportPDF(treatment);
    }
  };

  // Generate text content for copying
  const generateTextContent = (treatment: TreatmentPlan, config: TreatmentViewerConfig) => {
    const patientInfo = config.showPatientInfo && treatment.patientName ? `Patient: ${treatment.patientName}` : '';
    const doctorInfo = treatment.doctor ? `Dr. ${treatment.doctor.firstName} ${treatment.doctor.lastName}` : '';

    return `Treatment Plan Document
${config.showPatientInfo && treatment.patientName ? `Patient: ${treatment.patientName}` : ''}
${config.showDoctorInfo && doctorInfo ? `Prescribing Doctor: ${doctorInfo}` : ''}
Created on ${formatDate(treatment.createdAt)}
Status: ${treatment.status.toUpperCase()}

TREATMENT TITLE:
${treatment.title}

DIAGNOSIS:
${treatment.diagnosis}

TREATMENT PLAN:
${treatment.plan}

${treatment.goals?.length ? `TREATMENT GOALS:\n${treatment.goals.map(goal => `• ${goal}`).join('\n')}\n\n` : ''}${treatment.medicationDetails?.length ? `MEDICATIONS:\n${treatment.medicationDetails.map(med => `• ${med.name} ${med.strength} - ${med.frequency} - ${med.instructions}`).join('\n')}\n\n` : ''}${treatment.pharmacy ? `PHARMACY:\n${treatment.pharmacy.name}\n${treatment.pharmacy.address.street}, ${treatment.pharmacy.address.city}, ${treatment.pharmacy.address.state} ${treatment.pharmacy.address.zipCode}\n\n` : ''}${config.showMetadata ? `Document ID: ${treatment._id.slice(-8)}` : ''}`;
  };

  // Generate HTML content for printing with professional styling
  const generatePrintContent = (treatment: TreatmentPlan, config: TreatmentViewerConfig) => {
    const currentYear = new Date().getFullYear();
    const doctorInfo = treatment.doctor ? `Dr. ${treatment.doctor.firstName} ${treatment.doctor.lastName}` : '';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${config.documentTitle} - ${treatment.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            .page {
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1in;
              background: white;
              min-height: 11in;
            }
            .document-header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .branding {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
            }
            .logo-container { display: flex; align-items: center; gap: 12px; }
            .logo {
              width: 40px;
              height: 40px;
              background: #2563eb;
              color: white;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 18px;
            }
            .logo-text { display: flex; flex-direction: column; }
            .logo-title { font-size: 20px; font-weight: bold; color: #1f2937; }
            .logo-subtitle { font-size: 12px; color: #6b7280; font-weight: 500; }
            .document-id { text-align: right; font-size: 11px; color: #6b7280; }
            .document-title h1 {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              text-align: center;
              margin-bottom: 8px;
            }
            .patient-info {
              text-align: center;
              font-size: 14px;
              color: #4b5563;
              margin-bottom: 8px;
            }
            .document-date {
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            .section { margin-bottom: 25px; }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .content-block {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 12px;
            }
            .medication-item {
              background: white;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 10px;
            }
            .medication-name {
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .medication-details {
              font-size: 13px;
              color: #4b5563;
              line-height: 1.4;
            }
            .goal-item {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              margin-bottom: 8px;
            }
            .goal-number {
              background: #2563eb;
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
              flex-shrink: 0;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            }
            .status-active { background: #dcfce7; color: #166534; }
            .status-completed { background: #dbeafe; color: #1e40af; }
            .status-discontinued { background: #f3f4f6; color: #374151; }
            .document-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #6b7280;
              text-align: center;
            }
            .compliance-badges {
              display: flex;
              justify-content: center;
              gap: 8px;
              margin-bottom: 15px;
              flex-wrap: wrap;
            }
            .badge {
              background: #f3f4f6;
              color: #374151;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 500;
            }
            @media print {
              body { print-color-adjust: exact; }
              .page { margin: 0; padding: 0.5in; }
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
                  <div>Document ID: ${treatment._id.slice(-8)}</div>
                </div>
              </div>

              <div class="document-title">
                <h1>${config.documentTitle}</h1>
                ${config.showPatientInfo && treatment.patientName ?
                  `<div class="patient-info">Patient: ${treatment.patientName}</div>` : ''}
                <div class="document-date">Generated on ${formatDate(treatment.createdAt)}</div>
              </div>
            </div>

            <div class="document-content">
              <!-- Treatment Overview -->
              <div class="section">
                <div class="section-title">Treatment Overview</div>
                <div class="content-block">
                  <div style="margin-bottom: 10px;">
                    <strong>Title:</strong> ${treatment.title}
                  </div>
                  <div style="margin-bottom: 10px;">
                    <strong>Status:</strong>
                    <span class="status-badge status-${treatment.status}">${treatment.status}</span>
                  </div>
                  <div style="margin-bottom: 10px;">
                    <strong>Start Date:</strong> ${TreatmentUtils.formatDate(treatment.startDate)}
                  </div>
                  ${treatment.endDate ? `
                    <div style="margin-bottom: 10px;">
                      <strong>End Date:</strong> ${TreatmentUtils.formatDate(treatment.endDate)}
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Diagnosis -->
              <div class="section">
                <div class="section-title">Diagnosis</div>
                <div class="content-block">
                  ${treatment.diagnosis}
                </div>
              </div>

              <!-- Treatment Plan -->
              <div class="section">
                <div class="section-title">Treatment Plan</div>
                <div class="content-block">
                  ${treatment.plan}
                </div>
              </div>

              ${treatment.goals?.length ? `
                <div class="section">
                  <div class="section-title">Treatment Goals</div>
                  ${treatment.goals.map((goal, index) => `
                    <div class="goal-item">
                      <div class="goal-number">${index + 1}</div>
                      <div>${goal}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${treatment.medicationDetails?.length ? `
                <div class="section">
                  <div class="section-title">Prescribed Medications</div>
                  ${treatment.medicationDetails.map(med => `
                    <div class="medication-item">
                      <div class="medication-name">${med.name}</div>
                      ${med.genericName ? `<div class="medication-details">Generic: ${med.genericName}</div>` : ''}
                      <div class="medication-details">
                        <strong>Strength:</strong> ${med.strength} |
                        <strong>Form:</strong> ${med.dosageForm} |
                        <strong>Quantity:</strong> ${med.quantity}
                      </div>
                      <div class="medication-details">
                        <strong>Frequency:</strong> ${med.frequency} |
                        <strong>Refills:</strong> ${med.refills}
                      </div>
                      <div class="medication-details">
                        <strong>Instructions:</strong> ${med.instructions}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              ${treatment.pharmacy ? `
                <div class="section">
                  <div class="section-title">Pharmacy Information</div>
                  <div class="content-block">
                    <div style="margin-bottom: 8px;"><strong>${treatment.pharmacy.name}</strong></div>
                    ${treatment.pharmacy.chainName ? `<div style="margin-bottom: 8px;">Chain: ${treatment.pharmacy.chainName}</div>` : ''}
                    <div style="margin-bottom: 8px;">
                      ${treatment.pharmacy.address.street}<br>
                      ${treatment.pharmacy.address.city}, ${treatment.pharmacy.address.state} ${treatment.pharmacy.address.zipCode}
                    </div>
                    <div>Phone: ${treatment.pharmacy.phone}</div>
                  </div>
                </div>
              ` : ''}

              ${config.showDoctorInfo && treatment.doctor ? `
                <div class="section">
                  <div class="section-title">Prescribing Doctor</div>
                  <div class="content-block">
                    <div style="margin-bottom: 8px;"><strong>Dr. ${treatment.doctor.firstName} ${treatment.doctor.lastName}</strong></div>
                    ${treatment.doctor.primarySpecialty ? `<div style="margin-bottom: 8px;">Specialty: ${treatment.doctor.primarySpecialty}</div>` : ''}
                    ${treatment.doctor.licenseNumber ? `<div>License: ${treatment.doctor.licenseNumber}</div>` : ''}
                  </div>
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
                  <div>This document was generated automatically by MedScribe AI Clinical Platform</div>
                  <div style="margin-top: 5px;">© ${currentYear} MedScribe. All rights reserved.</div>
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

  // If not open or no treatment, don't render anything
  if (!open || !treatment) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col",
        "animate-in fade-in-0 duration-300",
        "bg-background",
        className
      )}
      aria-describedby="treatment-plan-document"
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
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {finalConfig.documentTitle}
                  {finalConfig.showPatientInfo && treatment.patientName && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      - {treatment.patientName}
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
                    onClick={() => actions.onShare!(treatment)}
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
                    onClick={() => actions.onDownload!(treatment)}
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
              <div className="bg-muted/30 border-b border-border">
                <div className="p-6 md:p-8">
                  {/* Application Branding */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
                        <Stethoscope className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground">MedScribe</span>
                        <span className="text-xs text-muted-foreground font-medium">v2.0 Clinical Platform</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        HIPAA Compliant
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        ID: {treatment._id.slice(-8)}
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
                      {finalConfig.documentTitle}
                    </h1>

                    {/* Patient information for doctor views */}
                    {finalConfig.showPatientInfo && treatment.patientName && (
                      <div className="mb-4">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          <User className="h-3 w-3 mr-2" />
                          Patient: {treatment.patientName}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Generated on {formatDate(treatment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", TreatmentUtils.getStatusColor(treatment.status))}
                        >
                          {TreatmentUtils.getStatusIcon(treatment.status)}
                          <span className="ml-1">{treatment.status.toUpperCase()}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-6 md:p-8 bg-card">
                {/* Enhanced Treatment content sections with professional typography */}
                <div className="space-y-8">
                  {/* Document Overview */}
                  <div className="space-y-3">
                    {/* Enhanced Data Indicator */}
                    {TreatmentUtils.hasEnhancedData(treatment) && (
                      <div className="p-3 bg-muted/30 border border-border rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Comprehensive Treatment Plan
                        </h4>
                        <p className="text-foreground text-xs">
                          This treatment plan includes detailed medication information, pharmacy details, and associated clinical data.
                        </p>
                      </div>
                    )}

                    {/* Treatment Information */}
                    {(() => {
                      const duration = TreatmentUtils.getDuration(treatment.startDate, treatment.endDate);
                      const doctorInfo = treatment.doctor ? `Dr. ${treatment.doctor.firstName} ${treatment.doctor.lastName}` : null;

                      return (
                        <div className="p-3 bg-muted/30 border border-border rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2 text-sm">Treatment Information</h4>
                          <div className="grid grid-cols-1 gap-1 text-xs">
                            <div className="text-foreground">
                              <span className="font-medium">Duration:</span> {duration}
                            </div>
                            <div className="text-foreground">
                              <span className="font-medium">Start Date:</span> {TreatmentUtils.formatDate(treatment.startDate)}
                            </div>
                            {treatment.endDate && (
                              <div className="text-foreground">
                                <span className="font-medium">End Date:</span> {TreatmentUtils.formatDate(treatment.endDate)}
                              </div>
                            )}
                            {finalConfig.showDoctorInfo && doctorInfo && (
                              <div className="text-foreground">
                                <span className="font-medium">Prescribing Doctor:</span> {doctorInfo}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Treatment Title Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Treatment Overview
                    </h2>
                    <div className="p-4 bg-muted/30 border border-border rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3 text-lg">{treatment.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={cn("text-sm", TreatmentUtils.getStatusColor(treatment.status))}
                        >
                          {TreatmentUtils.getStatusIcon(treatment.status)}
                          <span className="ml-1">{treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Started {TreatmentUtils.formatShortDate(treatment.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Diagnosis
                    </h2>
                    <div className="p-4 bg-muted/30 border border-border rounded-lg">
                      <p className="text-foreground leading-relaxed">{treatment.diagnosis}</p>
                    </div>
                  </div>

                  {/* Treatment Plan Section */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4">
                      Treatment Plan
                    </h2>
                    <div className="p-4 bg-muted/30 border border-border rounded-lg">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{treatment.plan}</p>
                    </div>
                  </div>

                  {/* Treatment Goals Section */}
                  {treatment.goals && treatment.goals.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Treatment Goals
                      </h2>
                      <div className="space-y-3">
                        {treatment.goals.map((goal, index) => (
                          <div key={index} className="p-3 bg-muted/30 border border-border rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-medium text-primary">{index + 1}</span>
                              </div>
                              <p className="text-foreground text-sm leading-relaxed">{goal}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications Section */}
                  {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Prescribed Medications
                      </h2>
                      <div className="space-y-4">
                        {treatment.medicationDetails.map((medication, index) => (
                          <div key={index} className="p-4 bg-muted/30 border border-border rounded-lg">
                            <div className="space-y-3">
                              {/* Medication Header */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-foreground text-lg">{medication.name}</h4>
                                  {medication.genericName && (
                                    <p className="text-sm text-muted-foreground">Generic: {medication.genericName}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  #{index + 1}
                                </Badge>
                              </div>

                              {/* Medication Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Strength:</span>
                                    <span className="text-foreground">{medication.strength}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Form:</span>
                                    <span className="text-foreground capitalize">{medication.dosageForm}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Quantity:</span>
                                    <span className="text-foreground">{medication.quantity}</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Frequency:</span>
                                    <span className="text-foreground">{medication.frequency}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-muted-foreground">Refills:</span>
                                    <span className="text-foreground">{medication.refills}</span>
                                  </div>
                                  {medication.duration && (
                                    <div className="flex justify-between">
                                      <span className="font-medium text-muted-foreground">Duration:</span>
                                      <span className="text-foreground">{medication.duration}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Instructions */}
                              <div className="pt-2 border-t border-border">
                                <h5 className="font-medium text-foreground mb-1 text-sm">Instructions:</h5>
                                <p className="text-foreground text-sm leading-relaxed">{medication.instructions}</p>
                              </div>

                              {/* Additional Codes */}
                              {(medication.ndc || medication.rxcui) && (
                                <div className="pt-2 border-t border-border">
                                  <div className="flex gap-4 text-xs text-muted-foreground">
                                    {medication.ndc && (
                                      <span>NDC: {medication.ndc}</span>
                                    )}
                                    {medication.rxcui && (
                                      <span>RXCUI: {medication.rxcui}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pharmacy Section */}
                  {treatment.pharmacy && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Pharmacy Information
                      </h2>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <div className="space-y-3">
                          {/* Pharmacy Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">{treatment.pharmacy.name}</h4>
                              {treatment.pharmacy.chainName && (
                                <p className="text-sm text-muted-foreground">Chain: {treatment.pharmacy.chainName}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {treatment.pharmacy.isVerified && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {treatment.pharmacy.isActive && (
                                <Badge variant="outline" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Pharmacy Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h5 className="font-medium text-foreground mb-2 flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                Address
                              </h5>
                              <div className="text-foreground space-y-1">
                                <div>{treatment.pharmacy.address.street}</div>
                                <div>
                                  {treatment.pharmacy.address.city}, {treatment.pharmacy.address.state} {treatment.pharmacy.address.zipCode}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-foreground mb-2 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                Contact
                              </h5>
                              <div className="text-foreground">
                                {treatment.pharmacy.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Associated SOAP Note Section */}
                  {treatment.soapNote && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Associated SOAP Note
                      </h2>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <div className="space-y-4">
                          {/* SOAP Note Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                SOAP Note - {TreatmentUtils.formatDate(treatment.soapNote.timestamp)}
                              </h4>
                              {treatment.soapNote.data?.specialty_detection?.specialty && (
                                <p className="text-sm text-muted-foreground">
                                  Specialty: {treatment.soapNote.data.specialty_detection.specialty}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {treatment.soapNote.status}
                            </Badge>
                          </div>

                          {/* SOAP Content */}
                          {treatment.soapNote.data?.soap_notes && (
                            <div className="space-y-4">
                              {/* Subjective */}
                              {treatment.soapNote.data.soap_notes.subjective && (
                                <div>
                                  <h5 className="font-medium text-foreground mb-2 text-sm uppercase tracking-wide">Subjective</h5>
                                  <p className="text-foreground text-sm leading-relaxed bg-background/50 p-3 rounded border">
                                    {treatment.soapNote.data.soap_notes.subjective}
                                  </p>
                                </div>
                              )}

                              {/* Objective */}
                              {treatment.soapNote.data.soap_notes.objective && (
                                <div>
                                  <h5 className="font-medium text-foreground mb-2 text-sm uppercase tracking-wide">Objective</h5>
                                  <p className="text-foreground text-sm leading-relaxed bg-background/50 p-3 rounded border">
                                    {treatment.soapNote.data.soap_notes.objective}
                                  </p>
                                </div>
                              )}

                              {/* Assessment */}
                              {treatment.soapNote.data.soap_notes.assessment && (
                                <div>
                                  <h5 className="font-medium text-foreground mb-2 text-sm uppercase tracking-wide">Assessment</h5>
                                  <p className="text-foreground text-sm leading-relaxed bg-background/50 p-3 rounded border">
                                    {treatment.soapNote.data.soap_notes.assessment}
                                  </p>
                                </div>
                              )}

                              {/* Plan */}
                              {treatment.soapNote.data.soap_notes.plan && (
                                <div>
                                  <h5 className="font-medium text-foreground mb-2 text-sm uppercase tracking-wide">Plan</h5>
                                  <p className="text-foreground text-sm leading-relaxed bg-background/50 p-3 rounded border">
                                    {treatment.soapNote.data.soap_notes.plan}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Quality Metrics */}
                          {treatment.soapNote.data?.quality_metrics && (
                            <div className="pt-3 border-t border-border">
                              <h5 className="font-medium text-foreground mb-2 text-sm">Quality Metrics</h5>
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div className="text-center">
                                  <div className="font-medium text-foreground">Overall</div>
                                  <div className="text-muted-foreground">{treatment.soapNote.data.quality_metrics.overall_score}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-foreground">Completeness</div>
                                  <div className="text-muted-foreground">{treatment.soapNote.data.quality_metrics.completeness_score}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-foreground">Accuracy</div>
                                  <div className="text-muted-foreground">{treatment.soapNote.data.quality_metrics.accuracy_score}%</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Safety Checks */}
                          {treatment.soapNote.data?.safety_checks && (
                            <div className="pt-3 border-t border-border">
                              <h5 className="font-medium text-foreground mb-2 text-sm flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" />
                                Safety Checks
                              </h5>
                              <div className="space-y-2 text-xs">
                                {treatment.soapNote.data.safety_checks.red_flags?.length > 0 && (
                                  <div>
                                    <span className="font-medium text-red-600">Red Flags:</span>
                                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                                      {treatment.soapNote.data.safety_checks.red_flags.map((flag, index) => (
                                        <li key={index}>{flag}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {treatment.soapNote.data.safety_checks.contraindications?.length > 0 && (
                                  <div>
                                    <span className="font-medium text-orange-600">Contraindications:</span>
                                    <ul className="list-disc list-inside text-muted-foreground ml-2">
                                      {treatment.soapNote.data.safety_checks.contraindications.map((contra, index) => (
                                        <li key={index}>{contra}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Doctor Information Section */}
                  {finalConfig.showDoctorInfo && treatment.doctor && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Prescribing Doctor
                      </h2>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-foreground text-lg">
                              Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                            </h4>
                            {treatment.doctor.primarySpecialty && (
                              <p className="text-sm text-muted-foreground">{treatment.doctor.primarySpecialty}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {treatment.doctor.email && (
                              <div>
                                <span className="font-medium text-muted-foreground">Email:</span>
                                <div className="text-foreground">{treatment.doctor.email}</div>
                              </div>
                            )}
                            {treatment.doctor.phone && (
                              <div>
                                <span className="font-medium text-muted-foreground">Phone:</span>
                                <div className="text-foreground">{treatment.doctor.phone}</div>
                              </div>
                            )}
                            {treatment.doctor.licenseNumber && (
                              <div>
                                <span className="font-medium text-muted-foreground">License:</span>
                                <div className="text-foreground">{treatment.doctor.licenseNumber}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Patient Information Section */}
                  {finalConfig.showPatientInfo && treatment.patient && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider border-b border-primary/20 pb-2 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Patient Information
                      </h2>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-foreground text-lg">
                              {treatment.patient.firstName} {treatment.patient.lastName}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {treatment.patient.email && (
                              <div>
                                <span className="font-medium text-muted-foreground">Email:</span>
                                <div className="text-foreground">{treatment.patient.email}</div>
                              </div>
                            )}
                            {treatment.patient.phone && (
                              <div>
                                <span className="font-medium text-muted-foreground">Phone:</span>
                                <div className="text-foreground">{treatment.patient.phone}</div>
                              </div>
                            )}
                            {treatment.patient.dateOfBirth && (
                              <div>
                                <span className="font-medium text-muted-foreground">Date of Birth:</span>
                                <div className="text-foreground">{TreatmentUtils.formatDate(treatment.patient.dateOfBirth)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Footer with Metadata */}
                  {finalConfig.showMetadata && (
                    <div className="pt-8 border-t border-border">
                      <div className="text-center space-y-4">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            HIPAA Compliant
                          </Badge>
                          <Badge variant="outline" className="text-xs">SOC 2 Type II</Badge>
                          <Badge variant="outline" className="text-xs">ISO 27001</Badge>
                          <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
                          <Badge variant="outline" className="text-xs">FDA Guidelines</Badge>
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          {(() => {
                            const hasEnhancedData = TreatmentUtils.hasEnhancedData(treatment);
                            return (
                              <>
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                    <span>Document ID: {treatment._id.slice(-8)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                    <span>Generated: {TreatmentUtils.formatShortDate(treatment.createdAt)}</span>
                                  </div>
                                  {hasEnhancedData && (
                                    <div className="flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></span>
                                      <span>Enhanced Data</span>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                          Generated by MedScribe AI Clinical Platform
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground/70">
                          © {new Date().getFullYear()} MedScribe. All rights reserved.
                        </div>
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

TreatmentViewer.displayName = "TreatmentViewer";

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook for managing Treatment Viewer state
 * Provides clean interface for showing/hiding the viewer
 */
export function useTreatmentViewer(): UseTreatmentViewerReturn {
  const [selectedTreatment, setSelectedTreatment] = React.useState<TreatmentPlan | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const openViewer = React.useCallback((treatment: TreatmentPlan) => {
    setSelectedTreatment(treatment);
    setIsOpen(true);
  }, []);

  const closeViewer = React.useCallback(() => {
    setIsOpen(false);
    setSelectedTreatment(null);
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    if (open) {
      setIsOpen(true);
    } else {
      closeViewer();
    }
  }, [closeViewer]);

  return {
    selectedTreatment,
    isOpen,
    openViewer,
    closeViewer,
    setOpen,
  };
}