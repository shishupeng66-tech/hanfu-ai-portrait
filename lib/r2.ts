import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2Configured =
  !!process.env.R2_ENDPOINT &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY &&
  !!process.env.R2_BUCKET_NAME &&
  !!process.env.R2_PUBLIC_URL;

const r2Client = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!r2Client) {
    throw new Error("R2 storage is not configured");
  }

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export function isR2Configured(): boolean {
  return r2Configured;
}

export function generateImageKey(userId: string, suffix: string = ""): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `portraits/${userId}/${timestamp}-${random}${suffix}.jpg`;
}
