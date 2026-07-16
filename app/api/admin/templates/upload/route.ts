import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdminApi } from "@/lib/auth/admin-api";
import { getErrorMessage } from "@/lib/error-utils";
import { uploadToR2 } from "@/lib/r2-storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/admin/templates/upload
export async function POST(req: NextRequest) {
  const adminAccess = await requireAdminApi(req.headers);
  if (!adminAccess.ok) return adminAccess.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const templateId = formData.get("templateId");
    const folder = formData.get("folder"); // "cover" | "previews" | "references" | "shots/<shotId>"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF` },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
    }

    // Validate templateId to prevent arbitrary path injection
    const tid = typeof templateId === "string" ? templateId.trim() : "";
    if (!tid || !/^[a-zA-Z0-9_-]+$/.test(tid)) {
      return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
    }

    const folderName = typeof folder === "string" ? folder.trim() : "uploads";
    // Only allow specific folder names
    const allowedFolders = ["cover", "previews", "references", "uploads"];
    const folderPrefix = folderName.split("/")[0];
    if (!allowedFolders.includes(folderPrefix) && !folderPrefix.startsWith("shots")) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type.split("/")[1] || "png";
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const key = `templates/${tid}/${folderName}/${filename}`;

    let url: string;
    try {
      url = await uploadToR2(key, buffer, file.type);
    } catch (r2Error) {
      console.error("[admin] R2 upload failed:", r2Error);
      return NextResponse.json(
        { error: "R2 storage is not configured. Please configure STORAGE_* environment variables. Template images cannot be saved as base64." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url,
      key,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("[admin] Upload error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to upload file") },
      { status: 500 },
    );
  }
}