"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  Stethoscope,
  Calendar,
  UserPlus,
  CheckCircle,
  Clock,
  AlertTriangle,
  MarkAsRead,
  X
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Get user profile to determine if doctor or patient
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id && session.user.role === "patient" 
      ? { userId: session.user.id as any } 
      : "skip"
  );

  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id && session.user.role === "doctor" 
      ? { userId: session.user.id as any } 
      : "skip"
  );

  // Get notifications
  const notifications = useQuery(
    api.notifications.getByUser,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get unread count
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get referrals for doctors
  const receivedReferrals = useQuery(
    api.doctorActions.getReferralsBySpecialist,
    doctorProfile ? { specialistId: doctorProfile._id } : "skip"
  );

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Calculate new referrals count
  const newReferralsCount = receivedReferrals?.filter(
    referral => referral.status === "pending"
  ).length || 0;

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assistance_provided":
        return <Stethoscope className="h-4 w-4 text-blue-600" />;
      case "appointment_scheduled":
        return <Calendar className="h-4 w-4 text-green-600" />;
      case "referral_received":
      case "referral_sent":
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      case "action_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "soap_shared":
        return <Bell className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
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

  const recentNotifications = notifications?.slice(0, 10) || [];
  const hasUnread = (unreadCount || 0) > 0;

  if (!session) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {hasUnread ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount! > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Notifications</h4>
              <p className="text-xs text-muted-foreground">
                {hasUnread ? `${unreadCount} unread message${unreadCount! > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Special section for doctors showing referral count */}
          {session.user.role === "doctor" && newReferralsCount > 0 && (
            <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {newReferralsCount} New Referral{newReferralsCount > 1 ? 's' : ''}
                </span>
                <Badge variant="secondary" className="ml-auto">
                  {newReferralsCount}
                </Badge>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Patients referred to you for specialist care
              </p>
            </div>
          )}
        </div>

        <Separator />

        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                  )}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.fromDoctor && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {notification.fromDoctor.firstName[0]}{notification.fromDoctor.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          Dr. {notification.fromDoctor.firstName} {notification.fromDoctor.lastName}
                        </span>
                      </div>
                    )}

                    {notification.action && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.action.status === "pending" && (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                          {notification.action.status === "in_progress" && (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              In Progress
                            </>
                          )}
                          {notification.action.status === "completed" && (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          )}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {recentNotifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page
                  window.location.href = session.user.role === "patient" 
                    ? "/patient/notifications" 
                    : "/doctor/referrals";
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
