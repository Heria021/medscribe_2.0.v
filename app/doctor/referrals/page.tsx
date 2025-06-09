"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  UserPlus,
  Search,
  AlertTriangle,
  FileText
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function DoctorReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState("");

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get referrals received by this specialist
  const receivedReferrals = useQuery(
    api.referrals.getReceivedReferrals,
    doctorProfile ? { toDoctorId: doctorProfile._id } : "skip"
  );

  // Get referrals sent by this doctor
  const sentReferrals = useQuery(
    api.referrals.getSentReferrals,
    doctorProfile ? { fromDoctorId: doctorProfile._id } : "skip"
  );

  // Mutations
  const acceptReferral = useMutation(api.referrals.accept);
  const declineReferral = useMutation(api.referrals.decline);
  const completeReferral = useMutation(api.referrals.complete);

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

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Urgent
        </Badge>;
      case "stat":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          STAT
        </Badge>;
      case "routine":
        return <Badge variant="secondary">Routine</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-blue-600">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };



  const handleAcceptReferral = async (referralId: string) => {
    try {
      await acceptReferral({
        referralId: referralId as any,
        responseMessage: responseNotes,
      });
      toast.success("Referral accepted! SOAP note has been shared with you.");
      setResponseNotes("");
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error accepting referral:", error);
      toast.error("Failed to accept referral");
    }
  };

  const handleDeclineReferral = async (referralId: string) => {
    if (!responseNotes.trim()) {
      toast.error("Please provide a reason for declining the referral");
      return;
    }

    try {
      await declineReferral({
        referralId: referralId as any,
        responseMessage: responseNotes,
      });
      toast.success("Referral declined. Notifications have been sent.");
      setResponseNotes("");
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error declining referral:", error);
      toast.error("Failed to decline referral");
    }
  };

  const filteredReceivedReferrals = receivedReferrals?.filter(referral => {
    const matchesSearch = !searchTerm ||
      referral.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.fromDoctor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.fromDoctor?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const filteredSentReferrals = sentReferrals?.filter(referral => {
    const matchesSearch = !searchTerm ||
      referral.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.toDoctor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.toDoctor?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

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
              Please complete your doctor profile to manage referrals.
            </p>
            <Button onClick={() => router.push("/doctor/settings/profile")}>
              Complete Profile
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground text-sm">
            Manage patient referrals received and sent
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content - Flex Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Received Referrals */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base">Received Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                {filteredReceivedReferrals.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No referrals found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "You haven't received any referrals yet"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                  {filteredReceivedReferrals.map((referral) => (
                    <div key={referral._id} className="p-3 hover:bg-muted/50 transition-colors border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {referral.patient?.firstName[0]}{referral.patient?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-sm">
                                {referral.patient?.firstName} {referral.patient?.lastName}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Referred by Dr. {referral.fromDoctor?.firstName} {referral.fromDoctor?.lastName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getUrgencyBadge(referral.urgency || "routine")}
                            {getStatusBadge(referral.status)}
                            <Badge variant="outline" className="text-xs">
                              {formatDate(referral.createdAt)}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div>
                              <h4 className="font-medium text-xs">Referral Reason:</h4>
                              <p className="text-xs text-muted-foreground">{referral.reasonForReferral}</p>
                            </div>
                            {referral.clinicalQuestion && (
                              <div>
                                <h4 className="font-medium text-xs">Clinical Question:</h4>
                                <p className="text-xs text-muted-foreground">{referral.clinicalQuestion}</p>
                              </div>
                            )}
                            {referral.responseMessage && (
                              <div>
                                <h4 className="font-medium text-xs">Response:</h4>
                                <p className="text-xs text-muted-foreground">{referral.responseMessage}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 ml-3">
                          {referral.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReferral(referral._id)}
                              className="h-7 px-2 text-xs"
                            >
                              Respond
                            </Button>
                          )}
                          {referral.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() => completeReferral({ referralId: referral._id })}
                              className="h-7 px-2 text-xs"
                            >
                              Complete
                            </Button>
                          )}
                          {(referral.status === "accepted" || referral.status === "completed") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/doctor/soap/view/${referral.soapNote?._id}`)}
                              className="h-7 px-2 text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View SOAP
                            </Button>
                          )}
                        </div>
                      </div>

                      {selectedReferral === referral._id && (
                        <div className="mt-3 p-3 border rounded bg-muted/50">
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium">Response Notes</label>
                              <Textarea
                                placeholder="Add your response or notes..."
                                value={responseNotes}
                                onChange={(e) => setResponseNotes(e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptReferral(referral._id)}
                                className="h-7 px-3 text-xs"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineReferral(referral._id)}
                                className="h-7 px-3 text-xs"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedReferral(null)}
                                className="h-7 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sent Referrals */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base">Sent Referrals</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full">
                {filteredSentReferrals.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium mb-1">No sent referrals</h3>
                    <p className="text-sm text-muted-foreground">
                      You haven't sent any referrals yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredSentReferrals.map((referral) => (
                      <div key={referral._id} className="p-3 hover:bg-muted/50 transition-colors border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {referral.patient?.firstName[0]}{referral.patient?.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-sm">
                                  {referral.patient?.firstName} {referral.patient?.lastName}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {referral.toDoctor
                                    ? `Referred to Dr. ${referral.toDoctor.firstName} ${referral.toDoctor.lastName}`
                                    : `Open referral for ${referral.specialtyRequired}`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getUrgencyBadge(referral.urgency || "routine")}
                              {getStatusBadge(referral.status)}
                              <Badge variant="outline" className="text-xs">
                                {formatDate(referral.createdAt)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            {(referral.status === "accepted" || referral.status === "completed") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/doctor/soap/view/${referral.soapNote?._id}`)}
                                className="h-7 px-2 text-xs"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                View SOAP
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
