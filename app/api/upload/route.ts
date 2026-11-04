import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Only raster formats are accepted. SVG is intentionally excluded: it is an
 * active document format and sanitising it reliably is harder than re-encoding
 * a raster image. Every upload is decoded and re-encoded with sharp, which
 * validates the bytes and strips EXIF, GPS and other metadata.
 */
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 4096;

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`upload:${getClientIp(request.headers)}`, 30, 60_000).success) {
    return NextResponse.json({ error: "Too many uploads. Slow down a little." }, { status: 429 });
  }

  // Next.js route handlers parse multipart bodies with the web FormData API.
  // That is the native equivalent of multer in this stack; no Express middleware
  // or temp files are needed.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported format. Use JPG, PNG or WebP." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Files must be 5 MB or smaller." }, { status: 400 });
  }

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "image";
  const id = `${base}-${randomUUID().slice(0, 8)}`;
  const filename = `${id}.webp`;

  let processed: { data: Buffer; width: number; height: number };
  try {
    const source = Buffer.from(await file.arrayBuffer());
    // Decoding also rejects files whose declared MIME type does not match their
    // real contents. Re-encoding drops all metadata and normalises the image.
    const result = await sharp(source, { limitInputPixels: 50_000_000, failOn: "error" })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    if (!result.info.width || !result.info.height) {
      throw new Error("Image has no readable dimensions");
    }

    processed = {
      data: result.data,
      width: result.info.width,
      height: result.info.height,
    };
  } catch (error) {
    console.error("Image validation failed", error);
    return NextResponse.json(
      { error: "That file is not a readable image. Try exporting it again as JPG, PNG or WebP." },
      { status: 400 },
    );
  }

  let url = `/uploads/${filename}`;
  let publicId: string | null = null;
  const width = processed.width;
  const height = processed.height;
  let size = processed.data.length;

  if (isCloudinaryConfigured()) {
    try {
      const uploaded = await uploadToCloudinary({
        buffer: processed.data,
        mimeType: "image/webp",
        publicId: id,
      });
      if (uploaded) {
        url = uploaded.url;
        publicId = uploaded.publicId;
        size = uploaded.bytes;
      }
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return NextResponse.json(
        { error: "Image storage is unavailable right now. Please try again." },
        { status: 502 },
      );
    }
  } else {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), processed.data);
    } catch (error) {
      console.error("Local upload failed", error);
      return NextResponse.json(
        { error: "Could not save the image. Please try again." },
        { status: 500 },
      );
    }
  }

  const media = await prisma.media.create({
    data: {
      url,
      publicId,
      filename,
      altText: base.replace(/-/g, " "),
      published: form.get("published") === "true",
      size,
      width,
      height,
      mimeType: "image/webp",
    },
  });

  revalidatePath("/admin/media");
  if (media.published) {
    revalidatePath("/photos");
    revalidatePath("/");
  }

  return NextResponse.json({ ok: true, media });
}
