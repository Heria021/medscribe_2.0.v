"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPNotesDisplay } from "@/components/patient/soap-notes-display";
import { SharedSOAPHistory } from "@/components/patient/shared-soap-history";
import {
  FileText,
  Search,
  Plus,
  SortAsc,
  SortDesc,
  Eye
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";



export default function SOAPHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

  const filteredNotes = (soapNotes || [])
    .filter(note =>
      searchTerm === "" ||
      note.subjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.plan.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SOAP Notes History</h1>
            <p className="text-muted-foreground">
              View and manage your generated clinical notes
            </p>
          </div>
          <Link href="/patient/soap/generate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New SOAP
            </Button>
          </Link>
        </div>

        {/* Shared SOAP Notes */}
        {patientProfile && (
          <SharedSOAPHistory patientId={patientProfile._id} />
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SOAP notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No SOAP notes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Generate your first SOAP note to get started"}
                </p>
                <Link href="/patient/soap/generate">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate SOAP Notes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note._id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">
                          SOAP Notes - {formatDate(note.createdAt)}
                        </CardTitle>
                        <CardDescription>
                          Generated in {note.processingTime}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getQualityColor(note.qualityScore)}>
                        {note.qualityScore}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedNote(note._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-blue-700 mb-1">Subjective</h4>
                      <p className="text-muted-foreground line-clamp-2">
                        {note.subjective.substring(0, 120)}...
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-700 mb-1">Assessment</h4>
                      <p className="text-muted-foreground line-clamp-2">
                        {note.assessment.substring(0, 120)}...
                      </p>
                    </div>
                  </div>
                  
                  {note.recommendations && note.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {note.recommendations.length} recommendation{note.recommendations.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredNotes.length}
                  </div>
                  <div className="text-muted-foreground">Total Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(filteredNotes.reduce((acc, note) => acc + (note.qualityScore || 0), 0) / filteredNotes.length)}%
                  </div>
                  <div className="text-muted-foreground">Avg Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredNotes.filter(note => (note.qualityScore || 0) >= 90).length}
                  </div>
                  <div className="text-muted-foreground">Excellent Quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
