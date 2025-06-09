import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
      isActive: true,
      twoFactorEnabled: false,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    emailVerifiedAt: v.optional(v.number()),
    twoFactorEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // If email is being updated, check if it's already taken
    if (updates.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existingUser && existingUser._id !== userId) {
        throw new Error("Email already taken");
      }
    }

    await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});
