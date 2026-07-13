import { type Template, safeValidateTemplate } from "./schema";

/**
 * Unified template loader.
 *
 * In development, templates are loaded from static JSON files in
 * data/templates/items/. In production, a build-time import map is used.
 *
 * Future: switch to database or CMS when template count grows.
 */

// ---------------------------------------------------------------------------
// Build-time template registry
// ---------------------------------------------------------------------------
// When new template JSON files are added to data/templates/items/,
// import them here and add to the registry.
//
// Example:
// import template001 from "./items/001-night-lantern/template.json";
// const TEMPLATE_REGISTRY: Template[] = [template001 as Template];

const TEMPLATE_REGISTRY: Template[] = [];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all templates (including drafts and archived).
 */
export function getAllTemplates(): Template[] {
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
  }).filter((t): t is Template => t !== null);
}

/**
 * Get only published templates, sorted by sortOrder descending.
 */
export function getPublishedTemplates(): Template[] {
  return getAllTemplates()
    .filter((t) => t.status === "published")
    .sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0));
}

/**
 * Get featured templates (published + featured flag).
 */
export function getFeaturedTemplates(): Template[] {
  return getPublishedTemplates().filter((t) => t.featured);
}

/**
 * Get a single template by ID.
 */
export function getTemplateById(id: string): Template | null {
  return getAllTemplates().find((t) => t.id === id) ?? null;
}

/**
 * Get a single template by slug.
 */
export function getTemplateBySlug(slug: string): Template | null {
  return getAllTemplates().find((t) => t.slug === slug) ?? null;
}

/**
 * Check if a template ID exists in the registry.
 */
export function hasTemplate(id: string): boolean {
  return getAllTemplates().some((t) => t.id === id);
}