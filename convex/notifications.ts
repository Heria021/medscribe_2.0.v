import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get notifications for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_id", (q) => q.eq("recipientId", args.userId))
      .order("desc")
      .collect();

    // Get related data
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification) => {
        let fromDoctor = null;
        let fromPatient = null;
        let soapNote = null;
        let action = null;

        if (notification.fromDoctorId) {
          fromDoctor = await ctx.db.get(notification.fromDoctorId);
        }
        if (notification.fromPatientId) {
          fromPatient = await ctx.db.get(notification.fromPatientId);
        }
        if (notification.relatedSoapNoteId) {
          soapNote = await ctx.db.get(notification.relatedSoapNoteId);
        }
        if (notification.relatedActionId) {
          action = await ctx.db.get(notification.relatedActionId);
        }

        return {
          ...notification,
          fromDoctor,
          fromPatient,
          soapNote,
          action,
        };
      })
    );

    return notificationsWithDetails;
  },
});

// Get unread notifications count
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_id", (q) => q.eq("recipientId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });
    return args.notificationId;
  },
});

// Mark all notifications as read for a user
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_id", (q) => q.eq("recipientId", args.userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { isRead: true })
      )
    );

    return unreadNotifications.length;
  },
});

// Create a notification
export const create = mutation({
  args: {
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("patient"), v.literal("doctor")),
    type: v.union(
      v.literal("soap_shared"),
      v.literal("assistance_provided"),
      v.literal("appointment_scheduled"),
      v.literal("referral_received"),
      v.literal("referral_sent"),
      v.literal("action_completed"),
      v.literal("action_updated")
    ),
    title: v.string(),
    message: v.string(),
    relatedSoapNoteId: v.optional(v.id("soapNotes")),
    relatedActionId: v.optional(v.id("doctorActions")),
    fromDoctorId: v.optional(v.id("doctors")),
    fromPatientId: v.optional(v.id("patients")),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});

// Get notifications by type
export const getByType = query({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("soap_shared"),
      v.literal("assistance_provided"),
      v.literal("appointment_scheduled"),
      v.literal("referral_received"),
      v.literal("referral_sent"),
      v.literal("action_completed"),
      v.literal("action_updated")
    ),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_id", (q) => q.eq("recipientId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();

    return notifications;
  },
});
