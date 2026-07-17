ALTER TABLE "generation_batch" ADD COLUMN "worker_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "heartbeat_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "refunded_credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "locked_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "locked_by" text;