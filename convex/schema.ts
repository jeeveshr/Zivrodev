import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Track client projects
    projects: defineTable({
        name: v.string(),
        status: v.union(
            v.literal("discovery"),
            v.literal("design"),
            v.literal("development"),
            v.literal("launched"),
            v.literal("scaling")
        ),
        clientId: v.id("clients"),
        progress: v.number(),
        startDate: v.number(),
        targetDate: v.optional(v.number()),
    }).index("by_client", ["clientId"]),

    // Client information
    clients: defineTable({
        name: v.string(),
        email: v.string(),
        company: v.optional(v.string()),
        plan: v.optional(v.string()),
    }).index("by_email", ["email"]),

    // Lead capture from forms & WhatsApp
    leads: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        source: v.union(
            v.literal("website"),
            v.literal("whatsapp"),
            v.literal("referral")
        ),
        message: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_source", ["source"]),

    // Contact form submissions
    contacts: defineTable({
        name: v.string(),
        email: v.string(),
        message: v.string(),
        phone: v.optional(v.string()),
        createdAt: v.number(),
    }),
});
