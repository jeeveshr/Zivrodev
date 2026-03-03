import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save new contact form submission
export const addContact = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        message: v.string(),
        phone: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const contactId = await ctx.db.insert("contacts", {
            ...args,
            createdAt: Date.now(),
        });
        return contactId;
    },
});

// Get all contacts (for admin dashboard later)
export const getContacts = query({
    handler: async (ctx) => {
        return await ctx.db.query("contacts").order("desc").collect();
    },
});
