CREATE TABLE "generation_batch" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text,
	"template_slug" text,
	"template_name_zh" text DEFAULT '',
	"template_name_en" text DEFAULT '',
	"generation_type" varchar(16) DEFAULT 'set' NOT NULL,
	"total_credits" integer DEFAULT 0 NOT NULL,
	"total_shots" integer DEFAULT 0 NOT NULL,
	"completed_shots" integer DEFAULT 0 NOT NULL,
	"failed_shots" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"trial_batch_id" text,
	"source_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portrait_template" ALTER COLUMN "credits_per_generation" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "batch_id" text;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "generation_type" varchar(16);--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "shot_id" text;--> statement-breakpoint
ALTER TABLE "generation_history" ADD COLUMN "shot_order" integer;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD CONSTRAINT "generation_batch_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_batch" ADD CONSTRAINT "generation_batch_trial_batch_id_generation_batch_id_fk" FOREIGN KEY ("trial_batch_id") REFERENCES "public"."generation_batch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_batch_user_idx" ON "generation_batch" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "generation_batch_status_idx" ON "generation_batch" USING btree ("status");--> statement-breakpoint
CREATE INDEX "generation_batch_template_idx" ON "generation_batch" USING btree ("template_id");--> statement-breakpoint
ALTER TABLE "generation_history" ADD CONSTRAINT "generation_history_batch_id_generation_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."generation_batch"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_history_batch_idx" ON "generation_history" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "generation_history_batch_shot_idx" ON "generation_history" USING btree ("batch_id","shot_id");
--> statement-breakpoint
-- Partial unique index: one trial batch can be deducted at most once
CREATE UNIQUE INDEX "generation_batch_trial_batch_unique_idx" ON "generation_batch" ("trial_batch_id") WHERE "trial_batch_id" IS NOT NULL;