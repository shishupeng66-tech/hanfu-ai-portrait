import { z } from "zod";

export const TemplateShotSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1),
  title: z.object({
    zh: z.string(),
    en: z.string(),
  }),
  prompt: z.string(),
  pose: z.string().optional().default(""),
  camera: z.string().optional().default(""),
  composition: z.string().optional().default(""),
  expression: z.string().optional().default(""),
  referenceImage: z.string().optional().default(""),
});

export const TemplatePromptSchema = z.object({
  base: z.string(),
  negative: z.string().optional().default(""),
});

export const TemplateGenerationSchema = z.object({
  model: z.string().default("seedream-4.5"),
  aspectRatio: z.string().default("3:4"),
  width: z.number().int().positive().default(1536),
  height: z.number().int().positive().default(2048),
  imageCount: z.number().int().positive().default(6),
});

export const TemplateSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]),
  version: z.number().int().positive().default(1),
  name: z.object({
    zh: z.string(),
    en: z.string(),
  }),
  description: z.object({
    zh: z.string().optional().default(""),
    en: z.string().optional().default(""),
  }),
  category: z.string().optional().default("hanfu"),
  dynasty: z.string().optional().default(""),
  styles: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  coverImage: z.string().optional().default(""),
  previewImages: z.array(z.string()).optional().default([]),
  referenceImages: z.array(z.string()).optional().default([]),
  prompt: TemplatePromptSchema,
  shots: z.array(TemplateShotSchema).optional().default([]),
  generation: TemplateGenerationSchema.optional(),
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export type Template = z.infer<typeof TemplateSchema>;
export type TemplateShot = z.infer<typeof TemplateShotSchema>;
export type TemplatePrompt = z.infer<typeof TemplatePromptSchema>;
export type TemplateGeneration = z.infer<typeof TemplateGenerationSchema>;

/**
 * Validate a template object. Returns the parsed template or throws.
 */
export function validateTemplate(data: unknown): Template {
  return TemplateSchema.parse(data);
}

/**
 * Validate a template object safely. Returns { success, data } or { success, error }.
 */
export function safeValidateTemplate(data: unknown) {
  return TemplateSchema.safeParse(data);
}

/**
 * Check if a published template has all required fields.
 */
export function isPublishedTemplateComplete(template: Template): boolean {
  return (
    template.name.zh.length > 0 &&
    template.name.en.length > 0 &&
    template.coverImage.length > 0 &&
    template.prompt.base.length > 0
  );
}

/**
 * Validate image paths start with /templates/.
 */
export function isValidTemplateImagePath(path: string): boolean {
  return path.startsWith("/templates/");
}