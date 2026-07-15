ALTER TABLE "portrait_template" ALTER COLUMN "generation_config" SET DEFAULT '{"model":"doubao-seedream-5-0-lite","size":"3072x4096","aspectRatio":"3:4","count":1,"workflow":"identity_transfer"}';--> statement-breakpoint
ALTER TABLE "portrait_template" ADD COLUMN "style_prompt" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "portrait_template_shot" ADD COLUMN "style_prompt" text DEFAULT '';