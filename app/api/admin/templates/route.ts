import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { listTemplates, createTemplate } from "@/lib/db/template-repository";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const createTemplateSchema = z.object({
  slug: z.string().min(1),
  nameZh: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionZh: z.string().optional().default(""),
  descriptionEn: z.string().optional().default(""),
  category: z.string().optional().default("hanfu"),
  dynasty: z.string().optional().default(""),
  styles: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  coverImage: z.string().optional().default(""),
  previewImages: z.array(z.string()).optional().default([]),
  referenceImages: z.array(z.string()).optional().default([]),
  basePrompt: z.string().optional().default(""),
  negativePrompt: z.string().optional().default(""),
  generationConfig: z.string().optional().default("{}"),
  creditsPerGeneration: z.number().int().min(0).optional().default(4),
  memberCreditsPerGeneration: z.number().int().min(0).optional(),
  featured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  shots: z
    .array(
      z.object({
        shotKey: z.string().min(1),
        sortOrder: z.number().int().min(0),
        titleZh: z.string().min(1),
        titleEn: z.string().min(1),
        prompt: z.string().optional().default(""),
        pose: z.string().optional().default(""),
        camera: z.string().optional().default(""),
        composition: z.string().optional().default(""),
        expression: z.string().optional().default(""),
        referenceImage: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

// ---------------------------------------------------------------------------
// GET /api/admin/templates
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const dynasty = url.searchParams.get("dynasty") ?? undefined;
    const featuredStr = url.searchParams.get("featured");
    const featured = featuredStr !== null ? featuredStr === "true" : undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
    const sortBy = url.searchParams.get("sortBy") ?? "sortOrder";
    const sortOrder = (url.searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    const result = await listTemplates({
      search,
      status,
      category,
      dynasty,
      featured,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error) {
    const isTableNotFound =
      error instanceof Error && "code" in error && (error as Error & { code: string }).code === "42P01";
    console.error("[admin] Failed to list templates:", error);
    return NextResponse.json(
      {
        error: isTableNotFound
          ? "Template database not initialized. Please run migration."
          : "Failed to list templates",
      },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/templates
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const body = await req.json();
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const template = await createTemplate(
      {
        slug: data.slug,
        status: "draft",
        version: 1,
        nameZh: data.nameZh,
        nameEn: data.nameEn,
        descriptionZh: data.descriptionZh,
        descriptionEn: data.descriptionEn,
        category: data.category,
        dynasty: data.dynasty,
        styles: data.styles,
        tags: data.tags,
        coverImage: data.coverImage,
        previewImages: data.previewImages,
        referenceImages: data.referenceImages,
        basePrompt: data.basePrompt,
        negativePrompt: data.negativePrompt,
        generationConfig: data.generationConfig,
        creditsPerGeneration: data.creditsPerGeneration,
        memberCreditsPerGeneration: data.memberCreditsPerGeneration,
        featured: data.featured,
        sortOrder: data.sortOrder,
        createdBy: adminAccess.user.id,
        updatedBy: adminAccess.user.id,
      },
      data.shots.map((s) => ({
        shotKey: s.shotKey,
        sortOrder: s.sortOrder,
        titleZh: s.titleZh,
        titleEn: s.titleEn,
        prompt: s.prompt,
        pose: s.pose,
        camera: s.camera,
        composition: s.composition,
        expression: s.expression,
        referenceImage: s.referenceImage,
      })),
    );

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("[admin] Failed to create template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}