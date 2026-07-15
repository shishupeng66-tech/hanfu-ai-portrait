import "server-only";

import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { portraitTemplate, portraitTemplateShot } from "@/lib/db/schema";
import { eq, and, or, like, desc, asc, sql, inArray } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DbTemplate = typeof portraitTemplate.$inferSelect;
export type DbTemplateInsert = typeof portraitTemplate.$inferInsert;
export type DbTemplateShot = typeof portraitTemplateShot.$inferSelect;
export type DbTemplateShotInsert = typeof portraitTemplateShot.$inferInsert;

export type TemplateWithShots = DbTemplate & { shots: DbTemplateShot[] };

export type TemplateListParams = {
  search?: string;
  status?: string;
  category?: string;
  dynasty?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type TemplateListResult = {
  templates: TemplateWithShots[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  shots: { id: string; shotKey: string; order: number; title: { zh: string; en: string }; referenceImage: string; stylePrompt: string }[];
  featured: boolean;
  sortOrder: number;
  creditsPerGeneration: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPublicTemplate(t: TemplateWithShots): PublicTemplate {
  return {
    id: t.id,
    slug: t.slug,
    status: t.status as "draft" | "published" | "archived",
    version: t.version,
    name: { zh: t.nameZh, en: t.nameEn },
    description: { zh: t.descriptionZh ?? "", en: t.descriptionEn ?? "" },
    category: t.category ?? "hanfu",
    dynasty: t.dynasty ?? "",
    styles: t.styles ?? [],
    tags: t.tags ?? [],
    stylePrompt: t.stylePrompt ?? "",
    coverImage: t.coverImage ?? "",
    previewImages: t.previewImages ?? [],
    shots: (t.shots ?? []).map((s) => ({
      id: s.id,
      shotKey: s.shotKey,
      order: s.sortOrder,
      title: { zh: s.titleZh, en: s.titleEn },
      referenceImage: s.referenceImage ?? "",
      stylePrompt: s.stylePrompt ?? "",
    })),
    featured: t.featured ?? false,
    sortOrder: t.sortOrder ?? 0,
    creditsPerGeneration: t.creditsPerGeneration ?? 4,
  };
}

/**
 * PostgreSQL error code 42P01 = undefined_table.
 * Use this to safely detect when the template tables haven't been created yet.
 */
function isTableNotFoundError(error: unknown): boolean {
  if (error instanceof Error && "code" in error) {
    return (error as Error & { code: string }).code === "42P01";
  }
  return false;
}

function emptyListResult(page = 1, pageSize = 20): TemplateListResult {
  return { templates: [], total: 0, page, pageSize, totalPages: 0 };
}

const TEMPLATE_TABLE_NOT_READY =
  "Portrait template tables not found in database. Please run migration.";

// ---------------------------------------------------------------------------
// Template CRUD
// ---------------------------------------------------------------------------

export async function listTemplates(
  params: TemplateListParams = {},
): Promise<TemplateListResult> {
  try {
    return await _listTemplatesUnsafe(params);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      console.warn("[templates] " + TEMPLATE_TABLE_NOT_READY);
      return emptyListResult(params.page ?? 1, params.pageSize ?? 20);
    }
    throw error;
  }
}

async function _listTemplatesUnsafe(
  params: TemplateListParams,
): Promise<TemplateListResult> {
  const {
    search,
    status,
    category,
    dynasty,
    featured,
    page = 1,
    pageSize = 20,
    sortBy = "sortOrder",
    sortOrder = "desc",
  } = params;

  const conditions: ReturnType<typeof eq>[] = [];

  if (status) {
    conditions.push(eq(portraitTemplate.status, status));
  }
  if (category) {
    conditions.push(eq(portraitTemplate.category, category));
  }
  if (dynasty) {
    conditions.push(eq(portraitTemplate.dynasty, dynasty));
  }
  if (featured !== undefined) {
    conditions.push(eq(portraitTemplate.featured, featured));
  }
  if (search) {
    const s = `%${search}%`;
    conditions.push(
      or(
        like(portraitTemplate.nameZh, s),
        like(portraitTemplate.nameEn, s),
        like(portraitTemplate.slug, s),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Count total
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(portraitTemplate)
    .where(where);
  const total = Number(countResult[0]?.count ?? 0);

  // Get order column
  const orderCol =
    sortBy === "updatedAt"
      ? portraitTemplate.updatedAt
      : sortBy === "createdAt"
        ? portraitTemplate.createdAt
        : sortBy === "creditsPerGeneration"
          ? portraitTemplate.creditsPerGeneration
          : portraitTemplate.sortOrder;

  const templates = await db
    .select()
    .from(portraitTemplate)
    .where(where)
    .orderBy(sortOrder === "asc" ? asc(orderCol) : desc(orderCol))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get shots for all templates
  const templateIds = templates.map((t) => t.id);
  let allShots: DbTemplateShot[] = [];
  if (templateIds.length > 0) {
    allShots = await db
      .select()
      .from(portraitTemplateShot)
      .where(inArray(portraitTemplateShot.templateId, templateIds))
      .orderBy(asc(portraitTemplateShot.sortOrder));
  }

  const shotsMap = new Map<string, DbTemplateShot[]>();
  for (const shot of allShots) {
    const list = shotsMap.get(shot.templateId) ?? [];
    list.push(shot);
    shotsMap.set(shot.templateId, list);
  }

  const templatesWithShots: TemplateWithShots[] = templates.map((t) => ({
    ...t,
    shots: shotsMap.get(t.id) ?? [],
  }));

  return {
    templates: templatesWithShots,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTemplateById(id: string): Promise<TemplateWithShots | null> {
  const templates = await db
    .select()
    .from(portraitTemplate)
    .where(eq(portraitTemplate.id, id))
    .limit(1);

  if (templates.length === 0) return null;

  const shots = await db
    .select()
    .from(portraitTemplateShot)
    .where(eq(portraitTemplateShot.templateId, id))
    .orderBy(asc(portraitTemplateShot.sortOrder));

  return { ...templates[0], shots };
}

export async function getTemplateBySlug(slug: string): Promise<TemplateWithShots | null> {
  const templates = await db
    .select()
    .from(portraitTemplate)
    .where(eq(portraitTemplate.slug, slug))
    .limit(1);

  if (templates.length === 0) return null;

  const shots = await db
    .select()
    .from(portraitTemplateShot)
    .where(eq(portraitTemplateShot.templateId, templates[0].id))
    .orderBy(asc(portraitTemplateShot.sortOrder));

  return { ...templates[0], shots };
}

export async function createTemplate(
  data: Omit<DbTemplateInsert, "id" | "createdAt" | "updatedAt">,
  shots: Omit<DbTemplateShotInsert, "id" | "templateId" | "createdAt" | "updatedAt">[] = [],
): Promise<TemplateWithShots> {
  const id = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(portraitTemplate).values({ id, ...data } as DbTemplateInsert);

    if (shots.length > 0) {
      await tx.insert(portraitTemplateShot).values(
        shots.map((s) => ({
          id: randomUUID(),
          templateId: id,
          ...s,
        })),
      );
    }
  });

  return (await getTemplateById(id))!;
}

export async function updateTemplate(
  id: string,
  data: Partial<Omit<DbTemplateInsert, "id" | "createdAt">>,
  shots?: Omit<DbTemplateShotInsert, "id" | "templateId" | "createdAt" | "updatedAt">[],
): Promise<TemplateWithShots | null> {
  const existing = await getTemplateById(id);
  if (!existing) return null;

  await db.transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx
        .update(portraitTemplate)
        .set({ ...data, updatedAt: new Date() } as typeof portraitTemplate.$inferInsert)
        .where(eq(portraitTemplate.id, id));
    }

    if (shots !== undefined) {
      // Delete existing shots
      await tx
        .delete(portraitTemplateShot)
        .where(eq(portraitTemplateShot.templateId, id));

      // Insert new shots
      if (shots.length > 0) {
        await tx.insert(portraitTemplateShot).values(
          shots.map((s) => ({
            id: randomUUID(),
            templateId: id,
            ...s,
          })),
        );
      }
    }
  });

  return getTemplateById(id);
}

export async function deleteTemplate(id: string): Promise<boolean> {
  await db
    .delete(portraitTemplate)
    .where(eq(portraitTemplate.id, id));
  return true;
}

export async function duplicateTemplate(
  id: string,
  newSlug: string,
  userId?: string,
): Promise<TemplateWithShots | null> {
  const existing = await getTemplateById(id);
  if (!existing) return null;

  const newId = randomUUID();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(portraitTemplate).values({
      id: newId,
      slug: newSlug,
      status: "draft",
      version: 1,
      nameZh: `${existing.nameZh} (Copy)`,
      nameEn: `${existing.nameEn} (Copy)`,
      descriptionZh: existing.descriptionZh,
      descriptionEn: existing.descriptionEn,
      category: existing.category,
      dynasty: existing.dynasty,
      styles: existing.styles,
      tags: existing.tags,
      stylePrompt: existing.stylePrompt,
      coverImage: existing.coverImage,
      previewImages: existing.previewImages,
      referenceImages: existing.referenceImages,
      basePrompt: existing.basePrompt,
      negativePrompt: existing.negativePrompt,
      generationConfig: existing.generationConfig,
      creditsPerGeneration: existing.creditsPerGeneration,
      memberCreditsPerGeneration: existing.memberCreditsPerGeneration,
      featured: false,
      sortOrder: 0,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    if (existing.shots.length > 0) {
      await tx.insert(portraitTemplateShot).values(
        existing.shots.map((s) => ({
          id: randomUUID(),
          templateId: newId,
          shotKey: s.shotKey,
          sortOrder: s.sortOrder,
          titleZh: s.titleZh,
          titleEn: s.titleEn,
          prompt: s.prompt,
          pose: s.pose,
          camera: s.camera,
          composition: s.composition,
          expression: s.expression,
          stylePrompt: s.stylePrompt,
          referenceImage: s.referenceImage,
          createdAt: now,
          updatedAt: now,
        })),
      );
    }
  });

  return getTemplateById(newId);
}

// ---------------------------------------------------------------------------
// Public template queries (safe for client consumption)
// ---------------------------------------------------------------------------

export async function getPublicPublishedTemplates(): Promise<PublicTemplate[]> {
  try {
    const result = await listTemplates({ status: "published", pageSize: 1000, sortBy: "sortOrder", sortOrder: "desc" });
    return result.templates.map(toPublicTemplate);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      console.warn("[templates] " + TEMPLATE_TABLE_NOT_READY);
      return [];
    }
    console.error("[templates] Failed to get published templates:", error);
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    return [];
  }
}

export async function getPublicFeaturedTemplates(): Promise<PublicTemplate[]> {
  try {
    const templates = await db
      .select()
      .from(portraitTemplate)
      .where(and(eq(portraitTemplate.status, "published"), eq(portraitTemplate.featured, true)))
      .orderBy(desc(portraitTemplate.sortOrder));

    const ids = templates.map((t) => t.id);
    let allShots: DbTemplateShot[] = [];
    if (ids.length > 0) {
      allShots = await db
        .select()
        .from(portraitTemplateShot)
        .where(inArray(portraitTemplateShot.templateId, ids))
        .orderBy(asc(portraitTemplateShot.sortOrder));
    }

    const shotsMap = new Map<string, DbTemplateShot[]>();
    for (const shot of allShots) {
      const list = shotsMap.get(shot.templateId) ?? [];
      list.push(shot);
      shotsMap.set(shot.templateId, list);
    }

    return templates.map((t) => toPublicTemplate({ ...t, shots: shotsMap.get(t.id) ?? [] }));
  } catch (error) {
    if (isTableNotFoundError(error)) {
      console.warn("[templates] " + TEMPLATE_TABLE_NOT_READY);
      return [];
    }
    console.error("[templates] Failed to get featured templates:", error);
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    return [];
  }
}

export async function getPublicTemplateById(id: string): Promise<PublicTemplate | null> {
  try {
    const t = await getTemplateById(id);
    if (!t || t.status !== "published") return null;
    return toPublicTemplate(t);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      console.warn("[templates] " + TEMPLATE_TABLE_NOT_READY);
      return null;
    }
    console.error("[templates] Failed to get template by id:", error);
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    return null;
  }
}

export async function getPublicTemplateBySlug(slug: string): Promise<PublicTemplate | null> {
  try {
    const t = await getTemplateBySlug(slug);
    if (!t || t.status !== "published") return null;
    return toPublicTemplate(t);
  } catch (error) {
    if (isTableNotFoundError(error)) {
      console.warn("[templates] " + TEMPLATE_TABLE_NOT_READY);
      return null;
    }
    console.error("[templates] Failed to get template by slug:", error);
    if (process.env.NODE_ENV === "development") {
      throw error;
    }
    return null;
  }
}