"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPDocumentView } from "@/components/patient/soap-document-view";
import { DoctorActionModal } from "@/components/doctor/doctor-action-modal";
import { DataTableCompact } from "@/components/ui/data-table-compact";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  FileText,
  Search,
  Calendar,
  Eye,
  ArrowLeft,
  Mail,
  Filter,
  Stethoscope,
  Clock,
  User,
  TrendingUp
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function SharedSOAPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSOAP, setSelectedSOAP] = useState<string | null>(null);
  const [filterUnread, setFilterUnread] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

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
    setSelectedSOAP(soapNoteId);
    
    // Mark as read
    try {
      await markAsRead({ sharedSoapNoteId: sharedSOAPId as any });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Filter shared notes
  const filteredNotes = sharedSOAPNotes?.filter(note => {
    const matchesSearch = !searchTerm || 
      note.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.soapNote?.subjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.soapNote?.assessment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterUnread || !note.isRead;
    
    return matchesSearch && matchesFilter;
  }) || [];

  const selectedNote = sharedSOAPNotes?.find(note => note.soapNote?._id === selectedSOAP);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  if (!doctorProfile) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-4">
              Please complete your doctor profile to view shared SOAP notes.
            </p>
            <Button onClick={() => router.push("/doctor/settings/profile")}>
              Complete Profile
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If viewing a specific SOAP note
  if (selectedNote && selectedNote.soapNote) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedSOAP(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shared Notes
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={selectedNote.isRead ? "secondary" : "default"}>
                {selectedNote.isRead ? "Read" : "New"}
              </Badge>
              <Badge variant="outline">
                Shared {formatDate(selectedNote.createdAt)}
              </Badge>
            </div>
          </div>

          {/* Patient Info */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedNote.patient?.profileImageUrl} />
                  <AvatarFallback>
                    {selectedNote.patient?.firstName[0]}{selectedNote.patient?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    {selectedNote.patient?.firstName} {selectedNote.patient?.lastName}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Patient • {selectedNote.patient?.gender} • Born {selectedNote.patient?.dateOfBirth}
                  </p>
                  {selectedNote.message && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 italic">
                      "{selectedNote.message}"
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOAP Document View */}
          <SOAPDocumentView
            soapNote={selectedNote.soapNote}
            patientName={`${selectedNote.patient?.firstName} ${selectedNote.patient?.lastName}`}
            showActions={false}
          />

          {/* Doctor Action Button */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Take Action</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide assistance, schedule appointments, or refer to specialists
                  </p>
                </div>
                <Button
                  onClick={() => setShowActionModal(true)}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Stethoscope className="h-4 w-4" />
                  Take Action
                </Button>
              </div>
            </CardContent>
          </Card>


          {/* Doctor Action Modal */}
          {showActionModal && selectedNote && doctorProfile && (
            <DoctorActionModal
              isOpen={showActionModal}
              onClose={() => setShowActionModal(false)}
              soapNoteId={selectedNote.soapNote._id}
              patientId={selectedNote.patientId}
              doctorId={doctorProfile._id}
              patientName={`${selectedNote.patient?.firstName} ${selectedNote.patient?.lastName}`}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Shared SOAP Notes</h1>
          <p className="text-muted-foreground">
            Review SOAP notes shared by your patients
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={filterUnread ? "default" : "outline"}
            onClick={() => setFilterUnread(!filterUnread)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {filterUnread ? "Show All" : "Unread Only"}
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Shared"
            value={sharedSOAPNotes?.length || 0}
            icon={<FileText className="h-4 w-4" />}
            description="SOAP notes shared with you"
            variant="compact"
            status="info"
          />
          <MetricCard
            title="Unread Notes"
            value={sharedSOAPNotes?.filter(note => !note.isRead).length || 0}
            icon={<Mail className="h-4 w-4" />}
            description="Require your attention"
            variant="compact"
            status={sharedSOAPNotes?.filter(note => !note.isRead).length ? "warning" : "success"}
          />
          <MetricCard
            title="This Week"
            value={sharedSOAPNotes?.filter(note =>
              Date.now() - note.createdAt < 7 * 24 * 60 * 60 * 1000
            ).length || 0}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Recently shared notes"
            variant="compact"
            status="success"
          />
        </div>

        {/* Enhanced Shared Notes Table */}
        <DataTableCompact
          title="Shared SOAP Notes"
          description="SOAP notes shared by patients for your review"
          data={filteredNotes.map(note => ({
            ...note,
            patientName: `${note.patient?.firstName} ${note.patient?.lastName}`,
            formattedDate: formatDate(note.createdAt),
            preview: note.soapNote?.subjective.substring(0, 80) + '...',
            assessmentPreview: note.soapNote?.assessment.substring(0, 80) + '...',
          }))}
          columns={[
            {
              key: "patientName",
              label: "Patient",
              sortable: true,
              render: (value, item) => (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={item.patient?.profileImageUrl} />
                    <AvatarFallback className="text-xs font-medium">
                      {item.patient?.firstName[0]}{item.patient?.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {value}
                      {!item.isRead && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.patient?.gender} • Born {item.patient?.dateOfBirth}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "formattedDate",
              label: "Shared Date",
              sortable: true,
              render: (value, item) => (
                <div className="space-y-1">
                  <div className="text-sm font-medium">{value}</div>
                  <StatusIndicator
                    status={item.isRead ? "success" : "warning"}
                    label={item.isRead ? "Read" : "Unread"}
                    variant="dot"
                    size="sm"
                  />
                </div>
              ),
            },
            {
              key: "preview",
              label: "Content Preview",
              render: (value, item) => (
                <div className="space-y-2 max-w-md">
                  {item.message && (
                    <div className="text-xs italic text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded">
                      "{item.message}"
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium text-blue-700 dark:text-blue-400">Subjective</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{value}</div>
                  </div>
                </div>
              ),
            },
            {
              key: "soapNote",
              label: "Quality",
              render: (value) => (
                <div className="flex items-center gap-2">
                  {value?.qualityScore && (
                    <Badge
                      variant="outline"
                      className={
                        value.qualityScore >= 90
                          ? "border-green-200 text-green-800 bg-green-50"
                          : value.qualityScore >= 80
                          ? "border-blue-200 text-blue-800 bg-blue-50"
                          : "border-yellow-200 text-yellow-800 bg-yellow-50"
                      }
                    >
                      {value.qualityScore}%
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {value?.processingTime || 'N/A'}
                  </div>
                </div>
              ),
            },
          ]}
          actions={(item) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewSOAP(item._id, item.soapNote!._id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Review
            </Button>
          )}
          searchable
          searchPlaceholder="Search by patient name or content..."
          emptyState={
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Shared SOAP Notes Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterUnread
                  ? "Try adjusting your search or filters"
                  : "Patients haven't shared any SOAP notes with you yet"}
              </p>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}
