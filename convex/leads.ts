import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createLead = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        source: v.union(
            v.literal("website"),
            v.literal("whatsapp"),
            v.literal("referral")
        ),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const leadId = await ctx.db.insert("leads", {
            ...args,
            createdAt: Date.now(),
        });
        return leadId;
    },
});

export const getProjects = query({
    handler: async (ctx) => {
        return await ctx.db.query("projects").collect();
    },
});
