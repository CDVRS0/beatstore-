import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.R2_BUCKET_NAME || "cdvrs-beat-store";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

/** Returns a short-lived URL the admin's browser can PUT a file to directly. */
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(r2, command, { expiresIn: 60 * 5 }); // 5 minutes
}

/** Returns a short-lived URL to fetch a private object (e.g. full-res deliverables). */
export async function getDownloadUrl(key: string, fileName?: string, expiresInSeconds = 60 * 15) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: fileName ? `attachment; filename="${fileName}"` : undefined,
  });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** Public URL for objects stored in the public-facing prefix (artwork, tagged previews). */
export function publicUrl(key: string) {
  const base = process.env.NEXT_PUBLIC_CDN_URL || "";
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

/** Generates a namespaced storage key, e.g. beats/<beatId>/artwork/cover.jpg */
export function buildKey(beatId: string, folder: "artwork" | "preview" | "files", fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `beats/${beatId}/${folder}/${Date.now()}-${safe}`;
}
