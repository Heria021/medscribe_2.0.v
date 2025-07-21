import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Pill,
  Calendar,
  Target,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Building2,
  Hash,
  Timer,
  RefreshCw,
  Heart,
  User,
  Phone,
  Package,
  Truck,
  ShoppingCart,
} from "lucide-react";
import type { TreatmentDetailsProps } from "../types";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

/**
 * Treatment Details Component
 * Clean, detailed, grid-based treatment details view for patients
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatment,
  standaloneMedications = [],
  onViewTreatment,
  className = "",
}) => {
  if (!treatment) {
    return (
      <div className={cn("h-full flex items-center justify-center p-12", className)}>
        <div className="text-center">
          <div className="p-4 bg-muted/30 rounded-full mb-4 mx-auto w-fit">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Select a Treatment Plan</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a treatment from the list to view detailed information about your care plan
          </p>
        </div>
      </div>
    );
  }

  // Fetch prescription orders for this treatment plan
  const prescriptionOrders = useQuery(
    api.prescriptionOrders.getOrdersByTreatmentPlanId,
    treatment ? { treatmentPlanId: treatment._id as Id<"treatmentPlans"> } : "skip"
  );

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "discontinued":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatLongDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
          {/* Treatment Header - Patient-Focused */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-2">{treatment.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Started {formatLongDate(treatment.startDate)}
                  </span>
                  {treatment.endDate && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Ends {formatLongDate(treatment.endDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn("text-sm px-3 py-1", getStatusColor(treatment.status))}
                >
                  {treatment.status === "active" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {treatment.status === "completed" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {treatment.status === "discontinued" && <AlertTriangle className="h-4 w-4 mr-2" />}
                  <span className="capitalize font-medium">{treatment.status}</span>
                </Badge>

                {onViewTreatment && (
                  <Button variant="outline" size="sm" onClick={() => onViewTreatment(treatment)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Full
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Primary Diagnosis */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary/10 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Diagnosis</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground leading-relaxed">{treatment.diagnosis}</p>
                <p className="text-xs text-muted-foreground">Medical condition identified</p>
              </div>
            </div>

            {/* Treatment Plan */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary/10 rounded">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Treatment Plan</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground leading-relaxed">{treatment.plan}</p>
                <p className="text-xs text-muted-foreground">Therapeutic approach and care plan</p>
              </div>
            </div>

            {/* Pharmacy Information */}
            {treatment.pharmacy ? (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Pharmacy</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{treatment.pharmacy.name}</p>
                  {treatment.pharmacy.chainName && (
                    <p className="text-xs text-muted-foreground">{treatment.pharmacy.chainName}</p>
                  )}
                  {treatment.pharmacy.address && (
                    <p className="text-xs text-muted-foreground">
                      {treatment.pharmacy.address.street}, {treatment.pharmacy.address.city}, {treatment.pharmacy.address.state} {treatment.pharmacy.address.zipCode}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {treatment.medicationDetails?.length || 0} prescription{(treatment.medicationDetails?.length || 0) !== 1 ? 's' : ''} sent
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pharmacy</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">No pharmacy selected</p>
                  <p className="text-xs text-muted-foreground">Pharmacy can be assigned by your doctor</p>
                </div>
              </div>
            )}

            {/* Medications Count */}
            {treatment.medicationDetails && treatment.medicationDetails.length > 0 ? (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Medications</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{treatment.medicationDetails.length} Prescribed</p>
                  <p className="text-xs text-muted-foreground">Active prescriptions in your treatment</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medications</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">No medications prescribed</p>
                  <p className="text-xs text-muted-foreground">Medications may be added to your treatment</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Sections */}
          <div className="space-y-6">
            {/* Diagnosis & Treatment Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Diagnosis</h2>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-foreground leading-relaxed">{treatment.diagnosis}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Treatment Plan</h2>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-foreground leading-relaxed">{treatment.plan}</p>
                </div>
              </div>
            </div>

            {/* Treatment Goals */}
            {treatment.goals && treatment.goals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Treatment Goals</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {treatment.goals.length} {treatment.goals.length === 1 ? 'Goal' : 'Goals'}
                  </Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {treatment.goals.map((goal: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-background rounded border">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medications - Enhanced Grid Layout */}
            {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Medications</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {treatment.medicationDetails.length} {treatment.medicationDetails.length === 1 ? 'Medication' : 'Medications'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {treatment.medicationDetails.map((medication, index: number) => {
                    return (
                      <div key={index} className="group relative bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                        {/* Compact Header Row */}
                        <div className="flex items-center justify-between p-3 pb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Medication Icon & Name */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                                <Pill className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm text-foreground truncate">{medication.name}</h4>
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-primary/5 text-primary border-primary/20">
                                    {medication.strength}
                                  </Badge>
                                </div>
                                {medication.genericName && (
                                  <p className="text-xs text-muted-foreground truncate">Generic: {medication.genericName}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span>{medication.quantity}</span>
                            </div>
                            {medication.refills > 0 && (
                              <div className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                <span>{medication.refills}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span className="font-medium">{medication.frequency}</span>
                            </div>
                          </div>
                        </div>

                        {/* Compact Details Grid */}
                        <div className="px-3 pb-3">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {/* Left: Dosage & Form */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Activity className="h-3 w-3" />
                                  <span className="font-medium">Form:</span>
                                </div>
                                <span className="text-foreground capitalize">{medication.dosageForm}</span>
                              </div>
                              {medication.duration && (
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span className="font-medium">Duration:</span>
                                  </div>
                                  <span className="text-foreground">{medication.duration}</span>
                                </div>
                              )}
                              {medication.ndc && (
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Hash className="h-3 w-3" />
                                    <span className="font-medium">NDC:</span>
                                  </div>
                                  <span className="text-foreground font-mono">{medication.ndc}</span>
                                </div>
                              )}
                            </div>

                            {/* Right: Instructions */}
                            <div className="space-y-1">
                              <div className="flex items-start gap-1.5 text-xs">
                                <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-muted-foreground">How to take: </span>
                                  <span className="text-foreground leading-relaxed">{medication.instructions}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Patient-Friendly Footer */}
                          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              {medication.rxcui && (
                                <span className="font-mono">RxCUI: {medication.rxcui}</span>
                              )}
                              <span className="capitalize">{medication.dosageForm} form</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                              <CheckCircle className="h-3 w-3" />
                              <span className="font-medium">Active Prescription</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Doctor Information */}
            {treatment.doctor && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Doctor</h2>
                </div>
                <div className="group relative bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                  {/* Compact Doctor Header */}
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Doctor Avatar & Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {treatment.doctor.firstName?.[0]}{treatment.doctor.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-foreground truncate">
                              Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                            </h4>
                            {treatment.doctor.primarySpecialty && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-primary/5 text-primary border-primary/20">
                                {treatment.doctor.primarySpecialty}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">Your treating physician</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Button */}
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 px-3 text-xs">
                      <Phone className="h-3 w-3" />
                      Contact
                    </Button>
                  </div>

                  {/* Professional Details */}
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {/* Left: Specialty & Credentials */}
                      <div className="space-y-1">
                        {treatment.doctor.primarySpecialty && (
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Stethoscope className="h-3 w-3" />
                              <span className="font-medium">Specialty:</span>
                            </div>
                            <span className="text-foreground">{treatment.doctor.primarySpecialty}</span>
                          </div>
                        )}
                        {treatment.doctor.licenseNumber && (
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Hash className="h-3 w-3" />
                              <span className="font-medium">License:</span>
                            </div>
                            <span className="text-foreground font-mono">{treatment.doctor.licenseNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Contact Info */}
                      <div className="space-y-1">
                        {treatment.doctor.email && (
                          <div className="flex items-start gap-1.5 text-xs">
                            <User className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-muted-foreground">Email: </span>
                              <span className="text-foreground">{treatment.doctor.email}</span>
                            </div>
                          </div>
                        )}
                        {treatment.doctor.phone && (
                          <div className="flex items-start gap-1.5 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-muted-foreground">Phone: </span>
                              <span className="text-foreground">{treatment.doctor.phone}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Footer */}
                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>Treating physician for this plan</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <CheckCircle className="h-3 w-3" />
                        <span className="font-medium">Active Care</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standalone Medications */}
            {standaloneMedications.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Additional Medications</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {standaloneMedications.length} {standaloneMedications.length === 1 ? 'Medication' : 'Medications'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {standaloneMedications.map((medication) => {
                    const dosageDisplay = typeof medication.dosage === 'object'
                      ? `${medication.dosage.quantity} • ${medication.dosage.frequency}`
                      : medication.dosage;

                    const frequencyDisplay = typeof medication.dosage === 'object'
                      ? medication.dosage.frequency
                      : medication.frequency;

                    const getStatusColor = (status: string) => {
                      return status === 'active'
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20';
                    };

                    return (
                      <div key={medication._id} className="group relative bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                        {/* Compact Header Row */}
                        <div className="flex items-center justify-between p-3 pb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Medication Icon & Name */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                                <Pill className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm text-foreground truncate">
                                    {medication.medicationName || medication.medication?.name}
                                  </h4>
                                  <Badge variant="outline" className={`text-xs px-1.5 py-0.5 h-5 ${getStatusColor(medication.status)}`}>
                                    {medication.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">Additional medication</p>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span className="font-medium">{dosageDisplay}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              <span className="font-medium">{frequencyDisplay}</span>
                            </div>
                          </div>
                        </div>

                        {/* Compact Details */}
                        <div className="px-3 pb-3">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {/* Left: Medication Info */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Hash className="h-3 w-3" />
                                  <span className="font-medium">Dosage:</span>
                                </div>
                                <span className="text-foreground">{dosageDisplay}</span>
                              </div>
                              {medication.instructions && (
                                <div className="flex items-start gap-1.5 text-xs">
                                  <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-muted-foreground">Instructions: </span>
                                    <span className="text-foreground">{medication.instructions}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right: Schedule & Doctor */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Timer className="h-3 w-3" />
                                  <span className="font-medium">Schedule:</span>
                                </div>
                                <span className="text-foreground">{frequencyDisplay}</span>
                              </div>
                              {medication.doctor && (
                                <div className="flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Stethoscope className="h-3 w-3" />
                                    <span className="font-medium">Prescribed by:</span>
                                  </div>
                                  <span className="text-foreground">Dr. {medication.doctor.firstName} {medication.doctor.lastName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Professional Footer */}
                          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <span>Standalone prescription</span>
                              {medication.startDate && (
                                <span>Started: {new Date(medication.startDate).toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                              <CheckCircle className="h-3 w-3" />
                              <span className="font-medium capitalize">{medication.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prescription Orders - Your Pharmacy Orders */}
            {prescriptionOrders && prescriptionOrders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Prescription Orders</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {prescriptionOrders.length} {prescriptionOrders.length === 1 ? 'Order' : 'Orders'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {prescriptionOrders.map((order, index) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "pending":
                          return "bg-yellow-100 text-yellow-800 border-yellow-200";
                        case "processing":
                          return "bg-blue-100 text-blue-800 border-blue-200";
                        case "ready":
                          return "bg-green-100 text-green-800 border-green-200";
                        case "picked_up":
                        case "delivered":
                          return "bg-primary/10 text-primary border-primary/20";
                        case "cancelled":
                        case "on_hold":
                          return "bg-destructive/10 text-destructive border-destructive/20";
                        default:
                          return "bg-muted text-muted-foreground border-border";
                      }
                    };

                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case "pending":
                          return <Clock className="h-3 w-3" />;
                        case "processing":
                          return <RefreshCw className="h-3 w-3" />;
                        case "ready":
                          return <CheckCircle className="h-3 w-3" />;
                        case "picked_up":
                          return <ShoppingCart className="h-3 w-3" />;
                        case "delivered":
                          return <Truck className="h-3 w-3" />;
                        case "cancelled":
                        case "on_hold":
                          return <AlertTriangle className="h-3 w-3" />;
                        default:
                          return <Clock className="h-3 w-3" />;
                      }
                    };

                    const getStatusMessage = (status: string) => {
                      switch (status) {
                        case "pending":
                          return "Your prescription has been sent to the pharmacy";
                        case "processing":
                          return "The pharmacy is preparing your medication";
                        case "ready":
                          return "Your medication is ready for pickup";
                        case "picked_up":
                          return "You have picked up your medication";
                        case "delivered":
                          return "Your medication has been delivered";
                        case "cancelled":
                          return "This prescription order was cancelled";
                        case "on_hold":
                          return "This prescription is temporarily on hold";
                        default:
                          return "Status unknown";
                      }
                    };

                    return (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="space-y-3">
                          {/* Order Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground">{order.medicationDetails.name}</h4>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{getStatusMessage(order.status)}</p>
                            </div>
                            {order.estimatedReadyTime && order.status !== "picked_up" && order.status !== "delivered" && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Expected Ready</p>
                                <p className="text-sm font-medium text-foreground">
                                  {new Date(order.estimatedReadyTime).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Medication Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                <Pill className="h-3 w-3" />
                                Your Medication
                              </div>
                              <p className="text-sm text-foreground">{order.medicationDetails.dosage}</p>
                              <p className="text-xs text-muted-foreground">Quantity: {order.medicationDetails.quantity}</p>
                              {order.medicationDetails.refills > 0 && (
                                <p className="text-xs text-muted-foreground">Refills: {order.medicationDetails.refills}</p>
                              )}
                            </div>

                            {/* Pharmacy Details */}
                            {order.pharmacy && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  <Building2 className="h-3 w-3" />
                                  Your Pharmacy
                                </div>
                                <p className="text-sm font-semibold text-foreground">{order.pharmacy.name}</p>
                                {order.pharmacy.chainName && (
                                  <p className="text-xs text-muted-foreground">{order.pharmacy.chainName}</p>
                                )}
                                {order.pharmacy.address && (
                                  <p className="text-xs text-muted-foreground">
                                    {order.pharmacy.address.street}, {order.pharmacy.address.city}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Delivery Method */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {order.deliveryMethod === "delivery" ? <Truck className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                                How You'll Get It
                              </div>
                              <p className="text-sm text-foreground capitalize">{order.deliveryMethod}</p>
                              {order.deliveryMethod === "delivery" && order.deliveryAddress && (
                                <p className="text-xs text-muted-foreground">
                                  Delivering to: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                </p>
                              )}
                              {order.deliveryMethod === "pickup" && (
                                <p className="text-xs text-muted-foreground">
                                  Pick up at pharmacy location
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Pharmacy Notes */}
                          {order.pharmacyNotes && (
                            <div className="p-3 bg-background rounded border">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Message from Pharmacy</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{order.pharmacyNotes}</p>
                            </div>
                          )}

                          {/* Important Instructions */}
                          {order.medicationDetails.instructions && (
                            <div className="p-3 bg-primary/5 rounded border border-primary/20">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Important Instructions</span>
                              </div>
                              <p className="text-sm text-foreground">{order.medicationDetails.instructions}</p>
                            </div>
                          )}

                          {/* Timeline */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                            <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                            {order.actualReadyTime && (
                              <span>Ready: {new Date(order.actualReadyTime).toLocaleDateString()}</span>
                            )}
                            {order.pickedUpAt && (
                              <span>Picked up: {new Date(order.pickedUpAt).toLocaleDateString()}</span>
                            )}
                            {order.deliveredAt && (
                              <span>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";
