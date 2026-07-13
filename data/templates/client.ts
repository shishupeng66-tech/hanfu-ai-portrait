/**
 * Client-side template helpers.
 *
 * Safe to import from client components. Only exposes public fields.
 * Need to be called from a Server Component or RSC to pass data as props.
 *
 * For server-side usage, use data/templates/server.ts.
 */

export type {
  PublicTemplate,
  PublicTemplateShot,
} from "./schema";

export { toPublicTemplate } from "./schema";