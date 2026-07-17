ALTER TABLE "generation_history" ADD COLUMN "attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "locked_by" text;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "heartbeat_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "last_error" text;