/**
 * Server-side template loader.
 *
 * DO NOT import this from client components — it exposes prompt secrets.
 * Client components should use data/templates/client.ts.
 */

import "server-only";

import {
  safeValidateTemplate,
  toPublicTemplate,
  type TemplateDefinition,
  type PublicTemplate,
} from "./schema";
import { TEMPLATE_REGISTRY } from "./registry.generated";

export type { TemplateDefinition, PublicTemplate } from "./schema";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function loadAllDefinitions(): TemplateDefinition[] {
  return TEMPLATE_REGISTRY.map((t) => {
    const result = safeValidateTemplate(t);
    if (!result.success) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[templates] Invalid template "${(t as { slug?: string }).slug ?? "unknown"}":`,
          result.error.flatten()
        );
      }
      return null;
    }
    return result.data;
  }).filter((t): t is TemplateDefinition => t !== null);
}

// ---------------------------------------------------------------------------
// Public API (server-side)
// ---------------------------------------------------------------------------

export function getAllTemplates(): TemplateDefinition[] {
  return loadAllDefinitions();
}

export function getPublishedTemplates(): TemplateDefinition[] {
  return loadAllDefinitions()
    .filter((t) => t.status === "published")
    .sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0));
}

export function getFeaturedTemplates(): TemplateDefinition[] {
  return getPublishedTemplates().filter((t) => t.featured);
}

export function getTemplateById(id: string): TemplateDefinition | null {
  return loadAllDefinitions().find((t) => t.id === id) ?? null;
}

export function getTemplateBySlug(slug: string): TemplateDefinition | null {
  return loadAllDefinitions().find((t) => t.slug === slug) ?? null;
}

export function hasTemplate(id: string): boolean {
  return loadAllDefinitions().some((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Public template helpers (safe for RSC → client props)
// ---------------------------------------------------------------------------

export function getPublicPublishedTemplates(): PublicTemplate[] {
  return getPublishedTemplates().map(toPublicTemplate);
}

export function getPublicFeaturedTemplates(): PublicTemplate[] {
  return getFeaturedTemplates().map(toPublicTemplate);
}

export function getPublicTemplateById(id: string): PublicTemplate | null {
  const t = getTemplateById(id);
  return t ? toPublicTemplate(t) : null;
}

export function getPublicTemplateBySlug(slug: string): PublicTemplate | null {
  const t = getTemplateBySlug(slug);
  return t ? toPublicTemplate(t) : null;
}