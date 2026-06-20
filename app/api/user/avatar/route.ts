import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getActiveSessionUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/error-utils";
import { uploadToR2, isR2Configured } from "@/lib/r2";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function generateAvatarKey(userId: string, ext: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `avatars/${userId}/${timestamp}-${random}.${ext}`;
}

function getExtensionFromType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export async function POST(req: NextRequest) {
  try {
    const access = await getActiveSessionUser(req.headers);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status }
      );
    }

    const userId = access.user.id;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = getExtensionFromType(file.type);
    let imageUrl: string;

    if (isR2Configured()) {
      const key = generateAvatarKey(userId, ext);
      imageUrl = await uploadToR2(buffer, key, file.type);
    } else {
      // Fallback: use data URL for local development without R2
      imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // Update user image in database
    const updatedUsers = await db
      .update(userTable)
      .set({ image: imageUrl, updatedAt: new Date() })
      .where(eq(userTable.id, userId))
      .returning({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        image: userTable.image,
        credits: userTable.credits,
        createdAt: userTable.createdAt,
      });

    const updatedUser = updatedUsers[0];

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error: unknown) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to upload avatar") },
      { status: 500 }
    );
  }
}
