import "server-only";

import { createHash } from "crypto";

/**
 * Minimal Cloudinary REST client. When the three environment variables are
 * present, uploads go to Cloudinary; otherwise the app stores them locally in
 * public/uploads. Keeping this dependency-free avoids a large SDK for two calls.
 */

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function config(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured() {
  return Boolean(config());
}

function sign(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  publicId: string;
  folder?: string;
  resourceType?: "image" | "video";
};

export type CloudinaryUpload = {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  bytes: number;
};

/**
 * Videos are delivered through a compression transformation (`q_auto:good`)
 * capped at 1920px wide and converted to MP4, so the stored original is never
 * sent to visitors. Cloudinary caches the derived asset at the CDN edge.
 */
export function compressedVideoUrl(publicId: string) {
  const settings = config();
  if (!settings) return null;
  return `https://res.cloudinary.com/${settings.cloudName}/video/upload/w_1920,c_limit,q_auto:good/${publicId}.mp4`;
}

/**
 * Signed parameters for a direct browser-to-Cloudinary video upload. Keeping
 * the file out of the Next.js request avoids serverless body-size limits, and
 * the API secret never reaches the client.
 */
export function videoUploadParams(id: string) {
  const settings = config();
  if (!settings) return null;

  const folder = "portfolio";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ folder, public_id: id, timestamp }, settings.apiSecret);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${settings.cloudName}/video/upload`,
    fields: {
      api_key: settings.apiKey,
      timestamp: String(timestamp),
      folder,
      public_id: id,
      signature,
    },
  };
}

export async function uploadToCloudinary({
  buffer,
  mimeType,
  publicId,
  folder = "portfolio",
  resourceType = "image",
}: UploadInput): Promise<CloudinaryUpload | null> {
  const settings = config();
  if (!settings) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ folder, public_id: publicId, timestamp }, settings.apiSecret);

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), publicId);
  form.append("api_key", settings.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${settings.cloudName}/${resourceType}/upload`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    bytes?: number;
  };

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width ?? null,
    height: data.height ?? null,
    bytes: data.bytes ?? buffer.length,
  };
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" = "image",
) {
  const settings = config();
  if (!settings) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ public_id: publicId, timestamp }, settings.apiSecret);

  const form = new FormData();
  form.append("api_key", settings.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("public_id", publicId);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${settings.cloudName}/${resourceType}/destroy`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    console.error("Cloudinary delete failed", response.status, await response.text().catch(() => ""));
  }
}
