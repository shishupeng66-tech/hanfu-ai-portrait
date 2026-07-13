CREATE TABLE "portrait_template" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"description_zh" text DEFAULT '',
	"description_en" text DEFAULT '',
	"category" varchar(64) DEFAULT 'hanfu',
	"dynasty" varchar(64) DEFAULT '',
	"styles" text[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"cover_image" text DEFAULT '',
	"preview_images" text[] DEFAULT '{}',
	"reference_images" text[] DEFAULT '{}',
	"base_prompt" text NOT NULL,
	"negative_prompt" text DEFAULT '',
	"generation_config" text DEFAULT '{}',
	"credits_per_generation" integer DEFAULT 4 NOT NULL,
	"member_credits_per_generation" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"updated_by" text,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portrait_template_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "portrait_template_shot" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"shot_key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"title_zh" text NOT NULL,
	"title_en" text NOT NULL,
	"prompt" text NOT NULL,
	"pose" text DEFAULT '',
	"camera" text DEFAULT '',
	"composition" text DEFAULT '',
	"expression" text DEFAULT '',
	"reference_image" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portrait_template_shot" ADD CONSTRAINT "portrait_template_shot_template_id_portrait_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."portrait_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portrait_template_slug_idx" ON "portrait_template" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portrait_template_status_idx" ON "portrait_template" USING btree ("status");--> statement-breakpoint
CREATE INDEX "portrait_template_featured_order_idx" ON "portrait_template" USING btree ("featured","sort_order");--> statement-breakpoint
CREATE INDEX "portrait_template_shot_template_idx" ON "portrait_template_shot" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "portrait_template_shot_key_idx" ON "portrait_template_shot" USING btree ("template_id","shot_key");