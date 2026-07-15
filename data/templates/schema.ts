import { z } from "zod";

// =============================================================================
// Sub-schemas
// =============================================================================

export const TemplateShotSchema = z.object({
  id: z.string().min(1),
  shotKey: z.string().optional().default(""),
  order: z.number().int().min(1),
  title: z.object({
    zh: z.string(),
    en: z.string(),
  }),
  prompt: z.string().optional().default(""),
  pose: z.string().optional().default(""),
  camera: z.string().optional().default(""),
  composition: z.string().optional().default(""),
  expression: z.string().optional().default(""),
  stylePrompt: z.string().optional().default(""),
  referenceImage: z.string().optional().default(""),
});

export const TemplatePromptSchema = z.object({
  base: z.string(),
  negative: z.string().optional().default(""),
});

export const TemplateGenerationSchema = z.object({
  workflow: z.string().default("identity_transfer"),
  model: z.string().default("doubao-seedream-5-0-lite"),
  size: z.string().default("3072x4096"),
  aspectRatio: z.string().default("3:4"),
  count: z.number().int().positive().default(1),
});

// =============================================================================
// Full template definition (server-side only — contains prompt secrets)
// =============================================================================

export const TemplateDefinitionSchema = z.object({
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
  stylePrompt: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  previewImages: z.array(z.string()).optional().default([]),
  referenceImages: z.array(z.string()).optional().default([]),
  prompt: TemplatePromptSchema.optional(),
  shots: z.array(TemplateShotSchema).optional().default([]),
  generation: TemplateGenerationSchema.optional(),
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  creditsPerGeneration: z.number().int().min(0).optional().default(4),
});

export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>;
export type TemplateShot = z.infer<typeof TemplateShotSchema>;
export type TemplatePrompt = z.infer<typeof TemplatePromptSchema>;
export type TemplateGeneration = z.infer<typeof TemplateGenerationSchema>;

// =============================================================================
// Public template (safe for client-side — NO prompt or generation config)
// =============================================================================

export type PublicTemplateShot = {
  id: string;
  shotKey: string;
  order: number;
  title: { zh: string; en: string };
  referenceImage: string;
  stylePrompt: string;
};

export type PublicTemplate = {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  version: number;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  category: string;
  dynasty: string;
  styles: string[];
  tags: string[];
  stylePrompt: string;
  coverImage: string;
  previewImages: string[];
  shots: PublicTemplateShot[];
  featured: boolean;
  sortOrder: number;
  creditsPerGeneration: number;
};

/**
 * Strip private fields from a template definition for client-side use.
 */
export function toPublicTemplate(template: TemplateDefinition): PublicTemplate {
  return {
    id: template.id,
    slug: template.slug,
    status: template.status,
    version: template.version,
    name: template.name,
    description: template.description,
    category: template.category ?? "hanfu",
    dynasty: template.dynasty ?? "",
    styles: template.styles ?? [],
    tags: template.tags ?? [],
    stylePrompt: template.stylePrompt ?? "",
    coverImage: template.coverImage ?? "",
    previewImages: template.previewImages ?? [],
    shots: (template.shots ?? []).map((s) => ({
      id: s.id,
      shotKey: s.shotKey ?? s.id,
      order: s.order,
      title: s.title,
      referenceImage: s.referenceImage ?? "",
      stylePrompt: s.stylePrompt ?? "",
    })),
    featured: template.featured ?? false,
    sortOrder: template.sortOrder ?? 0,
    creditsPerGeneration: template.creditsPerGeneration ?? 4,
  };
}

// =============================================================================
// Validation helpers
// =============================================================================

export function validateTemplate(data: unknown): TemplateDefinition {
  return TemplateDefinitionSchema.parse(data);
}

export function safeValidateTemplate(data: unknown) {
  return TemplateDefinitionSchema.safeParse(data);
}

export function isPublishedTemplateComplete(template: TemplateDefinition): boolean {
  return (
    template.name.zh.length > 0 &&
    template.name.en.length > 0 &&
    template.coverImage.length > 0
  );
}

export function isValidTemplateImagePath(path: string): boolean {
  return path.startsWith("/templates/");
}