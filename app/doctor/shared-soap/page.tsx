"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DoctorActionModal } from "@/components/doctor/doctor-action-modal";

import {
  FileText,
  Search,
  Eye,
  Mail,
  Stethoscope,
  Download,
  ArrowRight
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Skeleton Loading Component
function SharedSOAPSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* Notes List Skeleton */}
        <Card>
          <CardHeader className="py-0">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar Skeleton */}
                    <Skeleton className="h-9 w-9 rounded-full" />

                    {/* Content Skeleton */}
                    <div className="flex-1 space-y-2">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>

                      {/* SOAP Preview */}
                      <div className="bg-muted/50 rounded p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-7 w-24" />
                        </div>
                        <Skeleton className="h-7 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Profile Completion Component (Inside Dashboard Layout)
function ProfileCompletionContent({ doctorProfile }: { doctorProfile: any }) {
  // Define required fields for profile completion
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'primarySpecialty', label: 'Primary Specialty' },
    { key: 'licenseNumber', label: 'License Number' },
  ];

  const completedRequired = useMemo(() => {
    if (!doctorProfile) return [];
    return requiredFields.filter(field => {
      const value = doctorProfile[field.key];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [doctorProfile, requiredFields]);

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Access SOAP Notes</CardTitle>
          <p className="text-muted-foreground">
            {!doctorProfile
              ? "Set up your professional profile to view shared SOAP notes."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {doctorProfile && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completedRequired.length}/{requiredFields.length} fields</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${requiredCompletion}%` }}
                />
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {Math.round(requiredCompletion)}% Complete
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Access Shared SOAP Notes
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review patient-shared clinical notes</li>
                <li>• Take medical actions and provide feedback</li>
                <li>• Download and manage patient records</li>
                <li>• Collaborate with patients on care plans</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your professional profile to start reviewing shared SOAP notes from patients.
            </p>

            <Link href="/doctor/settings/profile" className="block">
              <Button className="w-full" size="lg">
                {!doctorProfile ? "Get Started" : "Complete Profile"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SharedSOAPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterShareType, setFilterShareType] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");

  // Action modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get shared SOAP notes
  const sharedSOAPNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesForDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  // Mark as read mutation
  const markAsRead = useMutation(api.sharedSoapNotes.markAsRead);

  // Check if profile is complete
  const isProfileComplete = useMemo(() => {
    if (!doctorProfile) return false;

    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'primarySpecialty', 'licenseNumber'] as const;
    return requiredFields.every(field => {
      const value = doctorProfile[field as keyof typeof doctorProfile];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [doctorProfile]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewSOAP = async (sharedSOAPId: string, soapNoteId: string) => {
    // Mark as read
    try {
      await markAsRead({ sharedSoapNoteId: sharedSOAPId as any });
    } catch (error) {
      console.error("Error marking as read:", error);
    }

    // Navigate to SOAP view route
    router.push(`/doctor/soap/view/${soapNoteId}`);
  };



  const handleTakeAction = async (note: any) => {
    // Mark as read
    try {
      await markAsRead({ sharedSoapNoteId: note._id as any });
    } catch (error) {
      console.error("Error marking as read:", error);
    }

    setSelectedNote(note);
    setActionModalOpen(true);
  };

  // Enhanced filtering logic
  const filteredNotes = sharedSOAPNotes?.filter(note => {
    // Search filter
    const matchesSearch = !searchTerm ||
      note.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.soapNote?.subjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.soapNote?.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.soapNote?.plan.toLowerCase().includes(searchTerm.toLowerCase());

    // Read status filter
    const matchesReadFilter = !filterUnread || !note.isRead;

    // Share type filter
    const matchesShareType = filterShareType === "all" || note.shareType === filterShareType;

    // Date range filter
    const matchesDateRange = (() => {
      if (filterDateRange === "all") return true;
      const now = Date.now();
      const noteDate = note.createdAt;

      switch (filterDateRange) {
        case "today":
          return now - noteDate < 24 * 60 * 60 * 1000;
        case "week":
          return now - noteDate < 7 * 24 * 60 * 60 * 1000;
        case "month":
          return now - noteDate < 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesReadFilter && matchesShareType && matchesDateRange;
  }) || [];

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && doctorProfile === undefined)) {
    return <SharedSOAPSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent doctorProfile={doctorProfile} />
      ) : (
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex-shrink-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight">Shared SOAP Notes</h1>
            <p className="text-muted-foreground text-sm">
              Review and take action on notes shared by patients
            </p>
          </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, MRN, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant={filterUnread ? "default" : "outline"}
              onClick={() => setFilterUnread(!filterUnread)}
              size="sm"
            >
              <Mail className="h-4 w-4 mr-1" />
              {filterUnread ? "All" : "Unread"}
            </Button>
            <Select value={filterShareType} onValueChange={setFilterShareType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="direct_share">Direct</SelectItem>
                <SelectItem value="referral_share">Referral</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes List - Takes remaining height */}
        <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-0 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Shared Notes</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {filteredNotes.length} notes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {/* Show different messages based on whether there are any notes at all vs filtered out */}
                  {!sharedSOAPNotes || sharedSOAPNotes.length === 0 ? (
                    <>
                      <h3 className="font-medium mb-1">No shared notes yet</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Shared SOAP notes will appear here when patients share them with you.
                        Patients can share notes directly or through referrals.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium mb-1">No notes match your filters</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-sm">
                        Try adjusting your search terms or filters to see more results.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterUnread(false);
                          setFilterShareType("all");
                          setFilterDateRange("all");
                        }}
                        className="mt-3"
                      >
                        Clear All Filters
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotes.map((note) => (
                    <div key={note._id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Avatar & Status */}
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {note.patient?.firstName[0]}{note.patient?.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          {!note.isRead && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Header Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">
                                {note.patient?.firstName} {note.patient?.lastName}
                              </h4>
                              <Badge
                                variant={note.shareType === "direct_share" ? "default" : "secondary"}
                                className="text-xs h-5"
                              >
                                {note.shareType === "direct_share" ? "Direct" : "Referral"}
                              </Badge>
                              {note.soapNote?.qualityScore && (
                                <Badge variant="outline" className="text-xs h-5 border-green-200 text-green-700">
                                  {note.soapNote.qualityScore}%
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                          </div>

                          {/* Info Row */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>MRN: <span className="font-medium">{note.patient?.mrn || 'N/A'}</span></span>
                            <span>Gender: <span className="font-medium capitalize">{note.patient?.gender}</span></span>
                            <span>DOB: <span className="font-medium">{note.patient?.dateOfBirth}</span></span>
                          </div>

                          {/* Message */}
                          {note.message && (
                            <div className="bg-blue-50/80 border-l-3 border-blue-400 pl-2 py-1">
                              <p className="text-xs text-blue-800 italic">"{note.message}"</p>
                            </div>
                          )}

                          {/* SOAP Preview */}
                          <div className="bg-muted/50 rounded p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium text-blue-700">Subjective:</span>
                                <p className="text-muted-foreground mt-0.5 leading-tight">
                                  {note.soapNote?.subjective.substring(0, 80)}...
                                </p>
                              </div>
                              {note.soapNote?.assessment && (
                                <div>
                                  <span className="font-medium text-green-700">Assessment:</span>
                                  <p className="text-muted-foreground mt-0.5 leading-tight">
                                    {note.soapNote.assessment.substring(0, 80)}...
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewSOAP(note._id, note.soapNote!._id)}
                                className="h-7 px-3 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTakeAction(note)}
                                className="h-7 px-3 text-xs"
                              >
                                <Stethoscope className="h-3 w-3 mr-1" />
                                Take Action
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const content = `SOAP Note - ${note.patient?.firstName} ${note.patient?.lastName}\n\nDate: ${new Date(note.createdAt).toLocaleDateString()}\n\nSubjective:\n${note.soapNote?.subjective}\n\nObjective:\n${note.soapNote?.objective}\n\nAssessment:\n${note.soapNote?.assessment}\n\nPlan:\n${note.soapNote?.plan}`;
                                const blob = new Blob([content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `soap-note-${note.patient?.firstName}-${note.patient?.lastName}-${new Date().toISOString().split('T')[0]}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Modal */}
        {selectedNote && doctorProfile && (
          <DoctorActionModal
            isOpen={actionModalOpen}
            onClose={() => setActionModalOpen(false)}
            soapNoteId={selectedNote.soapNote._id}
            patientId={selectedNote.patient._id}
            doctorId={doctorProfile._id}
            patientName={`${selectedNote.patient.firstName} ${selectedNote.patient.lastName}`}
            sharedSoapNoteId={selectedNote._id}
          />
        )}
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}