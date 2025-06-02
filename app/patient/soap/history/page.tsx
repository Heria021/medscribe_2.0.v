"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPNotesDisplay } from "@/components/patient/soap-notes-display";
import { Timeline, createTimelineFromSharedNotes } from "@/components/ui/timeline";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Calendar,
  Star,
  Clock,
  Download,
  Share,
  CheckCircle
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";



export default function SOAPHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get SOAP notes for this patient
  const soapNotes = useQuery(
    api.soapNotes.getByPatientId,
    patientProfile ? { patientId: patientProfile._id } : "skip"
  );

  // Get shared SOAP notes for this patient
  const sharedNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesByPatient,
    patientProfile ? { patientId: patientProfile._id } : "skip"
  );

  // Get doctor actions for this patient to show referral timeline
  const doctorActions = useQuery(
    api.doctorActions.getByPatient,
    patientProfile ? { patientId: patientProfile._id } : "skip"
  );

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  // Create a map of shared notes by SOAP note ID for quick lookup
  const sharedNotesMap = new Map();
  (sharedNotes || []).forEach(shared => {
    if (!sharedNotesMap.has(shared.soapNoteId)) {
      sharedNotesMap.set(shared.soapNoteId, []);
    }
    sharedNotesMap.get(shared.soapNoteId).push(shared);
  });

  const filteredNotes = (soapNotes || [])
    .filter(note =>
      searchTerm === "" ||
      note.subjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.plan.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const getQualityColor = (score?: number) => {
    if (!score) return 'bg-muted text-muted-foreground';
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
    if (score >= 80) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  if (selectedNote) {
    const note = soapNotes?.find(n => n._id === selectedNote);
    if (note) {
      return (
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedNote(null)}
              >
                ← Back to History
              </Button>
              <div className="flex items-center gap-2">
                <Badge className={getQualityColor(note.qualityScore)}>
                  Quality: {note.qualityScore}%
                </Badge>
                <Badge variant="outline">
                  {formatDate(note.createdAt)}
                </Badge>
              </div>
            </div>
            <SOAPNotesDisplay soapNote={note} />
          </div>
        </DashboardLayout>
      );
    }
  }

  // Calculate stats for the metrics
  const totalNotes = filteredNotes.length;
  const sharedCount = (sharedNotes || []).length;
  const avgQuality = totalNotes > 0
    ? Math.round(filteredNotes.reduce((acc, note) => acc + (note.qualityScore || 0), 0) / totalNotes)
    : 0;
  const recentNotes = filteredNotes.filter(note =>
    Date.now() - note.createdAt < 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">SOAP Notes History</h1>
            <p className="text-muted-foreground">
              View and manage your generated clinical notes
            </p>
          </div>
          <Link href="/patient/soap/generate">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Generate New SOAP
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Total Notes</p>
                  <p className="text-lg font-semibold">{totalNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 rounded-md">
                  <Star className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Avg Quality</p>
                  <p className="text-lg font-semibold">{avgQuality}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-500/10 rounded-md">
                  <Share className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Shared</p>
                  <p className="text-lg font-semibold">{sharedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500/10 rounded-md">
                  <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-lg font-semibold">{recentNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SOAP notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* SOAP Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card className="border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-muted rounded-lg mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No SOAP Notes Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No notes match your search criteria."
                    : "You haven't generated any SOAP notes yet."}
                </p>
                <Link href="/patient/soap/generate">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Your First SOAP Note
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map((note) => {
              const noteSharedWith = sharedNotesMap.get(note._id) || [];
              const timelineItems = createTimelineFromSharedNotes(noteSharedWith, doctorActions || [], note._id);

              return (
                <Card key={note._id} className="border hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/10 rounded-md">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm">SOAP Note</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {note.qualityScore && (
                            <Badge variant="outline" className={`text-xs border ${getQualityColor(note.qualityScore)}`}>
                              {note.qualityScore}%
                            </Badge>
                          )}
                          {noteSharedWith.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Share className="h-3 w-3 mr-1" />
                              {noteSharedWith.length}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Subjective: </span>
                          <span className="text-xs">
                            {note.subjective.length > 120
                              ? note.subjective.substring(0, 120) + "..."
                              : note.subjective}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Assessment: </span>
                          <span className="text-xs">
                            {note.assessment.length > 80
                              ? note.assessment.substring(0, 80) + "..."
                              : note.assessment}
                          </span>
                        </div>
                      </div>

                      {/* Timeline for Referrals and Sharing */}
                      {timelineItems.length > 0 && (
                        <div className="pt-3 border-t">
                          <Timeline items={timelineItems} />
                        </div>
                      )}

                      {/* Show sharing info if no timeline but note is shared */}
                      {timelineItems.length === 0 && noteSharedWith.length > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Share className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Shared with {noteSharedWith.length} doctor{noteSharedWith.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {noteSharedWith.slice(0, 3).map((shared: any) => (
                              <div key={shared._id} className="flex items-center gap-1.5 bg-muted rounded-md px-2 py-1">
                                <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {shared.doctor?.firstName?.[0] || 'D'}{shared.doctor?.lastName?.[0] || 'R'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-medium">
                                    Dr. {shared.doctor?.firstName || 'Unknown'} {shared.doctor?.lastName || 'Doctor'}
                                  </span>
                                  {shared.isRead ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                  )}
                                </div>
                              </div>
                            ))}
                            {noteSharedWith.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{noteSharedWith.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Footer with Actions */}
                  <CardFooter className="px-4 py-3 bg-muted/30 border-t">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {note.processingTime || 'Processing time not available'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`/patient/soap/view/${note._id}`}>
                          <Button variant="default" size="sm">
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                          </Button>
                        </Link>
                        <Button variant="default" size="sm">
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download
                        </Button>
                        <Button variant="default" size="sm">
                          <Share className="h-3.5 w-3.5 mr-1.5" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
