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
};

export type CloudinaryUpload = {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  bytes: number;
};

export async function uploadToCloudinary({
  buffer,
  mimeType,
  publicId,
  folder = "portfolio",
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
    `https://api.cloudinary.com/v1_1/${settings.cloudName}/image/upload`,
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

export async function deleteFromCloudinary(publicId: string) {
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
    `https://api.cloudinary.com/v1_1/${settings.cloudName}/image/destroy`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    console.error("Cloudinary delete failed", response.status, await response.text().catch(() => ""));
  }
}
