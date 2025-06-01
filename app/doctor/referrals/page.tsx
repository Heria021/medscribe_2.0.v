"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserPlus, 
  Search,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Stethoscope
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
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
    api.doctorActions.getReferralsBySpecialist,
    doctorProfile ? { specialistId: doctorProfile._id } : "skip"
  );

  // Get referrals sent by this doctor
  const sentReferrals = useQuery(
    api.doctorActions.getByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  // Mutations
  const updateActionStatus = useMutation(api.doctorActions.updateStatus);
  const acceptReferral = useMutation(api.doctorActions.acceptReferral);
  const declineReferral = useMutation(api.doctorActions.declineReferral);

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
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="outline">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-blue-600">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (actionId: string, newStatus: string) => {
    try {
      await updateActionStatus({
        actionId: actionId as any,
        status: newStatus as any,
        notes: responseNotes,
      });
      toast.success("Referral status updated successfully!");
      setResponseNotes("");
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error updating referral status:", error);
      toast.error("Failed to update referral status");
    }
  };

  const handleAcceptReferral = async (referralId: string) => {
    try {
      await acceptReferral({
        referralId: referralId as any,
        specialistResponse: responseNotes,
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
        specialistResponse: responseNotes,
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
      referral.referringDoctor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referringDoctor?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || referral.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredSentReferrals = sentReferrals?.filter(action => 
    action.actionType === "refer_to_specialist" && (
      statusFilter === "all" || action.status === statusFilter
    )
  ) || [];

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
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Referrals
          </h1>
          <p className="text-muted-foreground">
            Manage patient referrals received and sent
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="text-2xl font-bold">{receivedReferrals?.length || 0}</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {receivedReferrals?.filter(r => r.status === "pending").length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold">
                    {receivedReferrals?.filter(r => r.urgencyLevel === "urgent").length || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold">{filteredSentReferrals.length}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Received Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Received Referrals</CardTitle>
            <CardDescription>
              Patient referrals sent to you by other doctors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredReceivedReferrals.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No referrals found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "You haven't received any referrals yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceivedReferrals.map((referral) => (
                  <Card key={referral._id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={referral.patient?.profileImageUrl} />
                              <AvatarFallback>
                                {referral.patient?.firstName[0]}{referral.patient?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {referral.patient?.firstName} {referral.patient?.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Referred by Dr. {referral.referringDoctor?.firstName} {referral.referringDoctor?.lastName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getUrgencyBadge(referral.urgencyLevel || "medium")}
                            {getStatusBadge(referral.status)}
                            <Badge variant="outline">
                              {formatDate(referral.createdAt)}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h4 className="font-medium text-sm">Referral Reason:</h4>
                              <p className="text-sm text-muted-foreground">{referral.referralReason}</p>
                            </div>
                            {referral.notes && (
                              <div>
                                <h4 className="font-medium text-sm">Additional Notes:</h4>
                                <p className="text-sm text-muted-foreground">{referral.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {referral.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReferral(referral._id)}
                            >
                              Respond
                            </Button>
                          )}
                          {(referral.status === "accepted" || referral.status === "in_progress") && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(referral._id, "completed")}
                            >
                              Complete
                            </Button>
                          )}
                          {(referral.status === "accepted" || referral.status === "completed") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/doctor/soap/view/${referral.soapNote?._id}`)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View SOAP
                            </Button>
                          )}
                        </div>
                      </div>

                      {selectedReferral === referral._id && (
                        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Response Notes</label>
                              <Textarea
                                placeholder="Add your response or notes..."
                                value={responseNotes}
                                onChange={(e) => setResponseNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptReferral(referral._id)}
                              >
                                Accept Referral
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineReferral(referral._id)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedReferral(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sent Referrals */}
        {filteredSentReferrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sent Referrals</CardTitle>
              <CardDescription>
                Referrals you've sent to other specialists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSentReferrals.map((referral) => (
                  <Card key={referral._id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={referral.patient?.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {referral.patient?.firstName[0]}{referral.patient?.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {referral.patient?.firstName} {referral.patient?.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Referred to Dr. {referral.specialist?.firstName} {referral.specialist?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getUrgencyBadge(referral.urgencyLevel || "medium")}
                            {getStatusBadge(referral.status)}
                            <Badge variant="outline">
                              {formatDate(referral.createdAt)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
