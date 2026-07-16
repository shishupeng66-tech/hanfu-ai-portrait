import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/admin-api";
import {
  getTemplateById,
  updateTemplate,
  duplicateTemplate,
} from "@/lib/db/template-repository";
import { getErrorMessage } from "@/lib/error-utils";

// ---------------------------------------------------------------------------
// Shared action handlers
// ---------------------------------------------------------------------------

export async function publishTemplate(
  req: NextRequest,
  id: string,
) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const template = await getTemplateById(id);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Validate publish requirements
    const errors: string[] = [];
    if (!template.nameZh) errors.push("Chinese name is required");
    if (!template.nameEn) errors.push("English name is required");
    if (!template.slug) errors.push("Slug is required");
    if (template.creditsPerGeneration < 0) errors.push("Credits must be >= 0");

    let genConfig: Record<string, unknown> = {};
    try {
      genConfig = JSON.parse(template.generationConfig ?? "{}");
    } catch {
      errors.push("Generation config is invalid JSON");
    }

    const workflow = typeof genConfig.workflow === "string" ? genConfig.workflow : "prompt_generation";

    if (workflow === "identity_transfer") {
      // identity_transfer specific validation
      const hasTemplateImage =
        (template.referenceImages && template.referenceImages.length > 0 && template.referenceImages[0]?.trim()) ||
        (template.shots && template.shots.some((s) => s.referenceImage?.trim()));

      if (!hasTemplateImage) {
        errors.push(
          "Identity transfer requires at least one shot with a reference image",
        );
      }

      if (!genConfig.model || typeof genConfig.model !== "string" || !genConfig.model.trim()) {
        errors.push("Model is required in generationConfig for identity_transfer");
      }
    } else {
      // prompt_generation: keep existing validation
      if (!template.shots || template.shots.length === 0) {
        errors.push("At least one shot is required");
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Template cannot be published", details: errors },
        { status: 400 },
      );
    }

    const updated = await updateTemplate(id, {
      status: "published",
      updatedBy: adminAccess.user.id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin] Failed to publish template:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to publish template") },
      { status: 500 },
    );
  }
}

export async function archiveTemplate(
  req: NextRequest,
  id: string,
) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const updated = await updateTemplate(id, {
      status: "archived",
      archivedAt: new Date(),
      updatedBy: adminAccess.user.id,
    });

    if (!updated) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin] Failed to archive template:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to archive template") },
      { status: 500 },
    );
  }
}

export async function duplicateTemplateAction(
  req: NextRequest,
  id: string,
) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const body = await req.json();
    const duplicateSchema = z.object({ newSlug: z.string().min(1) });
    const parsed = duplicateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const duplicated = await duplicateTemplate(id, parsed.data.newSlug, adminAccess.user.id);

    if (!duplicated) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    console.error("[admin] Failed to duplicate template:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to duplicate template") },
      { status: 500 },
    );
  }
}