// Re-export from server.ts for backward compatibility.
// Prefer importing from data/templates/server.ts (server) or
// data/templates/client.ts (client) directly.
export {
  getAllTemplates,
  getPublishedTemplates,
  getFeaturedTemplates,
  getTemplateById,
  getTemplateBySlug,
  hasTemplate,
  getPublicPublishedTemplates,
  getPublicFeaturedTemplates,
  getPublicTemplateById,
  getPublicTemplateBySlug,
} from "./server";

export type { TemplateDefinition, PublicTemplate } from "./schema";
export { toPublicTemplate } from "./schema";