import { pgTable, text, timestamp, boolean, integer, varchar, index, AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // total available credits for the user
  credits: integer("credits").default(0).notNull(),
  // user role: 'admin' | 'user'
  role: text("role").default("user").notNull(),
  // current subscription plan
  planKey: text("plan_key").default("free"),
  // ban status
  banned: boolean("banned").default(false).notNull(),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Payment records (one-time purchases and subscription renewals)
export const payment = pgTable("payment", {
  id: text("id").primaryKey(),
  provider: varchar("provider", { length: 32 }).default("creem").notNull(),
  providerPaymentId: text("provider_payment_id").notNull().unique(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 8 }).default("usd").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(), // 'one_time' | 'subscription'
  planKey: varchar("plan_key", { length: 64 }),
  creditsGranted: integer("credits_granted").default(0).notNull(),
  raw: text("raw"), // store provider payload as JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Active subscriptions
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  provider: varchar("provider", { length: 32 }).default("creem").notNull(),
  providerSubId: text("provider_sub_id").notNull().unique(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  planKey: varchar("plan_key", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  raw: text("raw"), // store provider payload as JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Credit ledger for auditability
export const creditLedger = pgTable("credit_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: varchar("reason", { length: 64 }).notNull(), // 'subscription_cycle' | 'one_time_pack' | 'adjustment' | 'chat_usage' | ...
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionCreditSchedule = pgTable(
  "subscription_credit_schedule",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id")
      .notNull()
      .references(() => subscription.id, { onDelete: "cascade" })
      .unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    planKey: varchar("plan_key", { length: 64 }).notNull(),
    creditsPerGrant: integer("credits_per_grant").notNull(),
    intervalMonths: integer("interval_months").notNull(),
    grantsRemaining: integer("grants_remaining").notNull(),
    totalCreditsRemaining: integer("total_credits_remaining").notNull(),
    nextGrantAt: timestamp("next_grant_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => ({
    nextGrantIdx: index("subscription_credit_schedule_next_grant_idx").on(table.nextGrantAt),
  }),
);

// Chat sessions
export const chatSession = pgTable("chat_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  model: varchar("model", { length: 48 }).default("doubao-1-5-thinking-pro-250415").notNull(),
  totalMessages: integer("total_messages").default(0).notNull(),
  totalCreditsUsed: integer("total_credits_used").default(0).notNull(),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// Chat messages
export const chatMessage = pgTable("chat_message", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => chatSession.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 16 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Generation batch — groups multiple shot generations into a single "set" or "trial"
export const generationBatch = pgTable(
  "generation_batch",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: text("template_id"),
    templateSlug: text("template_slug"),
    templateNameZh: text("template_name_zh").default(""),
    templateNameEn: text("template_name_en").default(""),
    generationType: varchar("generation_type", { length: 16 }).notNull().default("set"),
    totalCredits: integer("total_credits").notNull().default(0),
    totalShots: integer("total_shots").notNull().default(0),
    completedShots: integer("completed_shots").notNull().default(0),
    failedShots: integer("failed_shots").notNull().default(0),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    trialBatchId: text("trial_batch_id").references(
      (): AnyPgColumn => generationBatch.id,
      { onDelete: "set null" },
    ),
    sourceImage: text("source_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index("generation_batch_user_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    statusIdx: index("generation_batch_status_idx").on(table.status),
    templateIdx: index("generation_batch_template_idx").on(table.templateId),
  }),
);

// Generation history for images and videos
export const generationHistory = pgTable(
  "generation_history",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 16 }).notNull(), // 'image' | 'video'
    prompt: text("prompt").notNull(),
    imageUrl: text("image_url"), // For image-to-video generation
    resultUrl: text("result_url"), // Final result URL
    taskId: text("task_id"), // For async video generation tracking
    status: varchar("status", { length: 16 }).notNull().default("pending"), // pending, processing, completed, failed
    creditsUsed: integer("credits_used").default(0).notNull(),
    metadata: text("metadata"), // JSON string for additional data
    error: text("error"), // Error message if failed

    // Phase 8.1 — batch & shot linkage
    batchId: text("batch_id").references(() => generationBatch.id, { onDelete: "set null" }),
    generationType: varchar("generation_type", { length: 16 }), // NULL for legacy records; 'trial' | 'set' for new
    shotId: text("shot_id"),
    shotOrder: integer("shot_order"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    batchIdx: index("generation_history_batch_idx").on(table.batchId),
    batchShotIdx: index("generation_history_batch_shot_idx").on(table.batchId, table.shotId),
  }),
);

// Password reset tokens
export const passwordResetToken = pgTable("password_reset_token", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter subscriptions
export const newsletterSubscription = pgTable("newsletter_subscription", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active, unsubscribed
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

// ---------------------------------------------------------------------------
// Portrait templates (admin-managed, database-backed)
// ---------------------------------------------------------------------------

export const portraitTemplate = pgTable(
  "portrait_template",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    status: varchar("status", { length: 16 }).notNull().default("draft"), // draft | published | archived
    version: integer("version").default(1).notNull(),
    nameZh: text("name_zh").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionZh: text("description_zh").default(""),
    descriptionEn: text("description_en").default(""),
    category: varchar("category", { length: 64 }).default("hanfu"),
    dynasty: varchar("dynasty", { length: 64 }).default(""),
    styles: text("styles").array().default([]),
    tags: text("tags").array().default([]),
    stylePrompt: text("style_prompt").default(""),
    coverImage: text("cover_image").default(""),
    previewImages: text("preview_images").array().default([]),
    referenceImages: text("reference_images").array().default([]),
    basePrompt: text("base_prompt").default(""),
    negativePrompt: text("negative_prompt").default(""),
    generationConfig: text("generation_config").default('{"model":"doubao-seedream-5-0-lite","size":"3072x4096","aspectRatio":"3:4","count":1,"workflow":"identity_transfer"}'),
    creditsPerGeneration: integer("credits_per_generation").default(1).notNull(),
    memberCreditsPerGeneration: integer("member_credits_per_generation"),
    featured: boolean("featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    slugIdx: index("portrait_template_slug_idx").on(table.slug),
    statusIdx: index("portrait_template_status_idx").on(table.status),
    featuredOrderIdx: index("portrait_template_featured_order_idx").on(
      table.featured,
      table.sortOrder,
    ),
  }),
);

export const portraitTemplateShot = pgTable(
  "portrait_template_shot",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => portraitTemplate.id, { onDelete: "cascade" }),
    shotKey: text("shot_key").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    titleZh: text("title_zh").notNull(),
    titleEn: text("title_en").notNull(),
    prompt: text("prompt").default(""),
    pose: text("pose").default(""),
    camera: text("camera").default(""),
    composition: text("composition").default(""),
    expression: text("expression").default(""),
    stylePrompt: text("style_prompt").default(""),
    referenceImage: text("reference_image").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    templateIdIdx: index("portrait_template_shot_template_idx").on(table.templateId),
    templateKeyIdx: index("portrait_template_shot_key_idx").on(table.templateId, table.shotKey),
  }),
);

// ---------------------------------------------------------------------------
// Drizzle relations
// ---------------------------------------------------------------------------

export const generationBatchRelations = relations(generationBatch, ({ one, many }) => ({
  user: one(user, {
    fields: [generationBatch.userId],
    references: [user.id],
  }),
  trialBatch: one(generationBatch, {
    fields: [generationBatch.trialBatchId],
    references: [generationBatch.id],
    relationName: "trial_batch_self_ref",
  }),
  generationHistory: many(generationHistory),
}));

export const generationHistoryRelations = relations(generationHistory, ({ one }) => ({
  user: one(user, {
    fields: [generationHistory.userId],
    references: [user.id],
  }),
  batch: one(generationBatch, {
    fields: [generationHistory.batchId],
    references: [generationBatch.id],
  }),
}));
