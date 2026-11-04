import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/svg+xml", ".svg"],
]);
const MAX_SIZE = 5 * 1024 * 1024;

function sanitizeSvg(svg: string) {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`upload:${getClientIp(request.headers)}`, 30, 60_000).success) {
    return NextResponse.json({ error: "Too many uploads. Slow down a little." }, { status: 429 });
  }

  // Next.js route handlers parse multipart bodies with the web FormData API.
  // That is the native equivalent of multer in this stack; no Express middleware
  // or temp files are needed.
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported format. Use JPG, PNG, WebP or SVG." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Files must be 5 MB or smaller." }, { status: 400 });
  }

  const ext = ALLOWED.get(file.type)!;
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "image";
  const id = `${base}-${randomUUID().slice(0, 8)}`;
  const filename = `${id}${ext}`;

  let buffer: Buffer;
  if (file.type === "image/svg+xml") {
    const text = sanitizeSvg(await file.text());
    buffer = Buffer.from(text, "utf8");
  } else {
    buffer = Buffer.from(await file.arrayBuffer());
  }

  let url = `/uploads/${filename}`;
  let publicId: string | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let size = buffer.length;

  if (isCloudinaryConfigured()) {
    try {
      const uploaded = await uploadToCloudinary({
        buffer,
        mimeType: file.type,
        publicId: id,
      });
      if (uploaded) {
        url = uploaded.url;
        publicId = uploaded.publicId;
        width = uploaded.width;
        height = uploaded.height;
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
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
    } catch (error) {
      console.error("Could not read image dimensions", error);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
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
      mimeType: file.type,
    },
  });

  revalidatePath("/admin/media");
  if (media.published) {
    revalidatePath("/photos");
    revalidatePath("/");
  }

  return NextResponse.json({ ok: true, media });
}
