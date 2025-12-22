import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Allowlist of authorized crew emails
  crewEmails: defineTable({
    email: v.string(), // original email
    normalizedEmail: v.string(), // lowercased + trimmed
    createdAt: v.number(),
  }).index("by_normalizedEmail", ["normalizedEmail"]),

  // User profiles (only created after successful allowlist check)
  users: defineTable({
    email: v.string(),
    normalizedEmail: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_normalizedEmail", ["normalizedEmail"]),

  // Locations for inventory grouping
  locations: defineTable({
    name: v.string(),
    createdAt: v.number(),
    isActive: v.boolean(),
  }).index("by_name", ["name"]),

  // Inventory items
  inventory: defineTable({
    name: v.string(), // can be empty
    qty: v.number(), // integer, default 1
    locationId: v.optional(v.id("locations")), // null = "No location"
    isActive: v.boolean(),
    updatedAt: v.number(),
    updatedByUserId: v.id("users"),
    updatedByName: v.string(), // denormalized
    updatedByEmail: v.string(), // denormalized
  })
    .index("by_isActive", ["isActive"])
    .index("by_isActive_locationId", ["isActive", "locationId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isActive", "locationId"],
    }),

  // Per-user location ordering preferences
  locationOrders: defineTable({
    userId: v.id("users"),
    locationId: v.id("locations"),
    order: v.number(), // integer
    updatedAt: v.number(),
  })
    .index("by_userId_locationId", ["userId", "locationId"])
    .index("by_userId", ["userId"]),

  // Notice board posts
  notices: defineTable({
    content: v.string(), // non-empty after trim
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdByUserId: v.id("users"),
    createdByName: v.string(), // denormalized
    createdByEmail: v.string(), // denormalized
  })
    .index("by_isActive_createdAt", ["isActive", "createdAt"])
    .index("by_createdByUserId", ["createdByUserId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["isActive"],
    }),
});

