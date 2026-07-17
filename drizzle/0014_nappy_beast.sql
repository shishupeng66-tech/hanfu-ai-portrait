ALTER TABLE "generation_batch" ADD COLUMN "queued_at" timestamp;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD COLUMN "dispatch_attempt_count" integer DEFAULT 0 NOT NULL;