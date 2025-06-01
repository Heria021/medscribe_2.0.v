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
import {
  FileText,
  Search,
  Calendar,
  Eye,
  ArrowLeft,
  Mail,
  Filter,
  Stethoscope
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Shared</p>
                  <p className="text-2xl font-bold">{sharedSOAPNotes?.length || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">
                    {sharedSOAPNotes?.filter(note => !note.isRead).length || 0}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">
                    {sharedSOAPNotes?.filter(note => 
                      Date.now() - note.createdAt < 7 * 24 * 60 * 60 * 1000
                    ).length || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shared Notes List */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No shared SOAP notes found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterUnread ? "Try adjusting your search or filters" : "Patients haven't shared any SOAP notes with you yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card 
                key={note._id} 
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer",
                  !note.isRead && "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20"
                )}
                onClick={() => handleViewSOAP(note._id, note.soapNote!._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={note.patient?.profileImageUrl} />
                        <AvatarFallback>
                          {note.patient?.firstName[0]}{note.patient?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {note.patient?.firstName} {note.patient?.lastName}
                          {!note.isRead && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Shared {formatDate(note.createdAt)}
                        </CardDescription>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {note.message && (
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-sm italic">"{note.message}"</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">Subjective</h4>
                        <p className="text-muted-foreground line-clamp-2">
                          {note.soapNote?.subjective.substring(0, 100)}...
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-700 mb-1">Assessment</h4>
                        <p className="text-muted-foreground line-clamp-2">
                          {note.soapNote?.assessment.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
