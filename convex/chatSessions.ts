import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new chat session
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    userType: v.union(v.literal("doctor"), v.literal("patient")),
    patientId: v.optional(v.id("patients")),
    doctorId: v.optional(v.id("doctors")),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("chatSessions", {
      userId: args.userId,
      userType: args.userType,
      patientId: args.patientId,
      doctorId: args.doctorId,
      title: args.title,
      messageCount: 0,
      lastMessageAt: Date.now(),
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return sessionId;
  },
});

// Get all chat sessions for a user
export const getUserSessions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .order("desc")
      .collect();

    return sessions;
  },
});

// Get a specific chat session
export const getSession = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

// Update session metadata
export const updateSession = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    messageCount: v.optional(v.number()),
    lastMessageAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sessionId, ...updates } = args;
    
    await ctx.db.patch(sessionId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return sessionId;
  },
});

// Archive a chat session
export const archiveSession = mutation({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.sessionId;
  },
});

// Delete a chat session and all its messages
export const deleteSession = mutation({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    // Delete all messages in the session
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the session
    await ctx.db.delete(args.sessionId);

    return args.sessionId;
  },
});

// Get recent sessions with message count
export const getRecentSessions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .order("desc")
      .take(limit);

    return sessions;
  },
});
