"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { 
  Bell, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Stethoscope,
  CalendarPlus,
  UserPlus,
  MarkAsRead
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function PatientNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get notifications
  const notifications = useQuery(
    api.notifications.getByUser,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get referrals for this patient
  const referrals = useQuery(
    api.referrals.getByPatient,
    patientProfile ? { patientId: patientProfile._id } : "skip"
  );

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assistance_provided":
        return <Stethoscope className="h-5 w-5 text-blue-600" />;
      case "appointment_scheduled":
        return <CalendarPlus className="h-5 w-5 text-green-600" />;
      case "referral_sent":
        return <UserPlus className="h-5 w-5 text-purple-600" />;
      case "action_completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    try {
      await markAllAsRead({ userId: session.user.id as any });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const filteredNotifications = notifications?.filter(notification => 
    filter === "all" || !notification.isRead
  ) || [];

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

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

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              Stay updated on your medical care and appointments
            </p>
          </div>
          <div className="mt-4">
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 space-y-6">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Notifications
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{notifications?.length || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assistance</p>
                  <p className="text-2xl font-bold">
                    {referrals?.filter(r => r.referralType === "consultation").length || 0}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-bold">
                    {referrals?.filter(r => r.status === "accepted").length || 0}
                  </p>
                </div>
                <CalendarPlus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Referrals</p>
                  <p className="text-2xl font-bold">
                    {referrals?.length || 0}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                  <p className="text-muted-foreground">
                    {filter === "unread" ? "You're all caught up!" : "You don't have any notifications yet"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification._id} 
                className={cn(
                  "hover:shadow-md transition-shadow",
                  !notification.isRead && "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                          {notification.title}
                          {!notification.isRead && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground">{notification.message}</p>
                      {notification.fromDoctor && (
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {notification.fromDoctor.firstName[0]}{notification.fromDoctor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">
                            Dr. {notification.fromDoctor.firstName} {notification.fromDoctor.lastName}
                          </span>
                        </div>
                      )}
                      {notification.action && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          {getActionStatusBadge(notification.action.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

          {/* Doctor Actions Section */}
          {doctorActions && doctorActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Actions</CardTitle>
                <CardDescription>
                  Track the status of assistance, appointments, and referrals from your doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctorActions.slice(0, 5).map((action) => (
                    <div key={action._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getNotificationIcon(action.actionType)}
                        <div>
                          <p className="font-medium">
                            {action.actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Dr. {action.doctor?.firstName} {action.doctor?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getActionStatusBadge(action.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(action.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
