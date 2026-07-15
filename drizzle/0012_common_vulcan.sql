ALTER TABLE "portrait_template" ALTER COLUMN "base_prompt" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "portrait_template" ALTER COLUMN "base_prompt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "portrait_template_shot" ALTER COLUMN "prompt" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "portrait_template_shot" ALTER COLUMN "prompt" DROP NOT NULL;