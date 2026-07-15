import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin-api";
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from "@/lib/db/template-repository";
import { getErrorMessage } from "@/lib/error-utils";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const updateTemplateSchema = z.object({
  slug: z.string().min(1).optional(),
  nameZh: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  descriptionZh: z.string().optional(),
  descriptionEn: z.string().optional(),
  category: z.string().optional(),
  dynasty: z.string().optional(),
  styles: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  stylePrompt: z.string().optional(),
  coverImage: z.string().optional(),
  previewImages: z.array(z.string()).optional(),
  referenceImages: z.array(z.string()).optional(),
  basePrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
  generationConfig: z.string().optional(),
  creditsPerGeneration: z.number().int().min(0).optional(),
  memberCreditsPerGeneration: z.number().int().min(0).nullable().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  version: z.number().int().positive().optional(),
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
        stylePrompt: z.string().optional().default(""),
        referenceImage: z.string().optional().default(""),
      }),
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// GET /api/admin/templates/[id]
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const { id } = await params;
    const template = await getTemplateById(id);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("[admin] Failed to get template:", error);
    return NextResponse.json({ error: "Failed to get template" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/templates/[id]
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const { shots, ...rest } = data;

    const template = await updateTemplate(
      id,
      {
        ...rest,
        updatedBy: adminAccess.user.id,
      },
      shots?.map((s) => ({
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
      })),
    );

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("[admin] Failed to update template:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to update template") },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/templates/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const { id } = await params;
    const template = await getTemplateById(id);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    if (force) {
      await deleteTemplate(id);
      return NextResponse.json({ success: true, action: "deleted" });
    }

    // Default: archive
    await updateTemplate(id, {
      status: "archived",
      archivedAt: new Date(),
      updatedBy: adminAccess.user.id,
    });

    return NextResponse.json({ success: true, action: "archived" });
  } catch (error) {
    console.error("[admin] Failed to delete template:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to delete template") },
      { status: 500 },
    );
  }
}