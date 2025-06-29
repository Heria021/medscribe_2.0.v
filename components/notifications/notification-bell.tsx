"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  FileText,
  Settings,
  AlertCircle,
  Info
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

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
    api.referrals.getReceivedReferrals,
    doctorProfile ? { toDoctorId: doctorProfile._id } : "skip"
  );

  // Mutations
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  // Real-time toast notifications for new notifications
  useEffect(() => {
    if (notifications && notifications.length > lastNotificationCount && lastNotificationCount > 0) {
      const newNotifications = notifications.slice(0, notifications.length - lastNotificationCount);

      newNotifications.forEach((notification) => {
        if (!notification.isRead) {
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.priority === "urgent" || notification.priority === "high" ? "destructive" : "default",
          });
        }
      });
    }

    if (notifications) {
      setLastNotificationCount(notifications.length);
    }
  }, [notifications, lastNotificationCount, toast]);

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

  const getNotificationIcon = (notification: any) => {
    const { type, category, priority } = notification;

    // Priority-based styling
    const getIconColor = () => {
      switch (priority) {
        case "urgent": return "text-red-600";
        case "high": return "text-orange-600";
        case "medium": return "text-blue-600";
        case "low": return "text-muted-foreground";
        default: return "text-muted-foreground";
      }
    };

    const iconClass = `h-4 w-4 ${getIconColor()}`;

    // Category and type-based icons
    switch (category) {
      case "clinical":
        if (type?.includes("soap")) return <FileText className={iconClass} />;
        if (type?.includes("referral")) return <UserPlus className={iconClass} />;
        return <Stethoscope className={iconClass} />;

      case "administrative":
        if (type?.includes("appointment")) return <Calendar className={iconClass} />;
        return <Settings className={iconClass} />;

      case "alert":
        return priority === "urgent" ? <AlertCircle className={iconClass} /> : <AlertTriangle className={iconClass} />;

      case "reminder":
        return <Clock className={iconClass} />;

      case "system":
        return <Info className={iconClass} />;

      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-xs">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="text-xs text-muted-foreground">Low</Badge>;
      default:
        return null;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    try {
      await markAllAsRead({ userId: session.user.id as any });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  // Get urgent notifications count for special highlighting
  const urgentNotifications = notifications?.filter(n => n.priority === "urgent" && !n.isRead) || [];
  const recentNotifications = notifications?.slice(0, 15) || [];
  const hasUnread = (unreadCount || 0) > 0;
  const hasUrgent = urgentNotifications.length > 0;

  if (!session) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors"
                > {hasUnread ? (
            <BellRing className={cn("h-5 w-5", hasUrgent && "text-red-600 animate-pulse")} />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <Badge
              variant={hasUrgent ? "destructive" : "secondary"}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount! > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Messages</h4>
              <p className="text-xs text-muted-foreground">
                {hasUnread ? `${unreadCount} unread message${unreadCount! > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs h-8"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Urgent notifications alert */}
          {hasUrgent && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  {urgentNotifications.length} Urgent Message{urgentNotifications.length > 1 ? 's' : ''}
                </span>
                <Badge variant="destructive" className="ml-auto text-xs">
                  Urgent
                </Badge>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Requires immediate attention
              </p>
            </div>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {!notifications ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No messages yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll see updates here when they arrive
              </p>
            </div>
          ) : (
            <div className="p-2">
              {recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer mb-2",
                    !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                  )}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification)}
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between">
                      <h5 className="text-sm font-medium leading-tight">
                        {notification.title}
                      </h5>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      {notification.relatedRecords?.doctorId && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              Dr
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            From Doctor
                          </span>
                        </div>
                      )}

                      {notification.priority && notification.priority !== "low" && (
                        <div className="ml-auto">
                          {getPriorityBadge(notification.priority)}
                        </div>
                      )}
                    </div>
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
                  router.push(session.user.role === "patient"
                    ? "/patient/notifications"
                    : "/doctor/notifications");
                }}
              >
                View all messages
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}