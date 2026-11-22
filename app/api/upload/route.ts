import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { compressedVideoUrl, isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Only raster formats are accepted. SVG is intentionally excluded: it is an
 * active document format and sanitising it reliably is harder than re-encoding
 * a raster image. Every upload is decoded and re-encoded with sharp, which
 * validates the bytes and strips EXIF, GPS and other metadata.
 *
 * Videos are validated by container signature and, when Cloudinary is
 * configured, uploaded there and delivered through a compression
 * transformation. Without Cloudinary the original file is stored locally.
 *
 * Résumés are a separate `purpose=resume` upload: a validated PDF stored in
 * public/uploads and served by the /uploads route. They are intentionally not
 * added to the media library.
 */
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const PDF_TYPES = new Set(["application/pdf"]);
const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 4096;

function looksLikeVideo(buffer: Buffer) {
  if (buffer.length < 12) return false;
  // WebM / Matroska EBML header.
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return true;
  }
  // MP4 / MOV both carry an ISO base media `ftyp` box near the start.
  return buffer.subarray(4, 8).toString("ascii") === "ftyp";
}

function looksLikePdf(buffer: Buffer) {
  if (buffer.length < 8) return false;
  // Every PDF starts with `%PDF-` and ends with an `%%EOF` marker.
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-" && buffer.lastIndexOf("%%EOF") !== -1;
}

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

  // Résumé uploads are stored as-is (never re-encoded) and are not added to the
  // media library, which only renders images and videos.
  if (form.get("purpose") === "resume") {
    if (!PDF_TYPES.has(file.type) && !/\.pdf$/i.test(file.name)) {
      return NextResponse.json({ error: "The résumé must be a PDF file." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "That file is empty." }, { status: 400 });
    }
    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "The résumé must be 10 MB or smaller." },
        { status: 400 },
      );
    }

    const source = Buffer.from(await file.arrayBuffer());
    if (!looksLikePdf(source)) {
      return NextResponse.json(
        { error: "That file is not a readable PDF. Try exporting it again." },
        { status: 400 },
      );
    }

    const pdfBase =
      file.name
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || "resume";
    const pdfId = `${pdfBase}-${randomUUID().slice(0, 8)}`;
    const filename = `${pdfId}.pdf`;
    const url = `/uploads/${filename}`;

    // PDFs are kept locally: this Cloudinary account (and many others by
    // default) blocks public PDF delivery, which would produce 401 links.
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), source);
    } catch (error) {
      console.error("Local PDF upload failed", error);
      return NextResponse.json(
        { error: "Could not save the résumé. Please try again." },
        { status: 500 },
      );
    }

    revalidatePath("/admin/settings");
    return NextResponse.json({
      ok: true,
      url,
      filename,
      mimeType: "application/pdf",
      size: source.length,
    });
  }

  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isVideo && !IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported format. Use JPG, PNG, WebP, MP4, WebM or MOV." },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 400 });
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Videos must be 100 MB or smaller."
          : "Images must be 4 MB or smaller.",
      },
      { status: 400 },
    );
  }

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || (isVideo ? "video" : "image");
  const id = `${base}-${randomUUID().slice(0, 8)}`;

  let filename: string;
  let mimeType: string;
  let url: string;
  let publicId: string | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let size = file.size;

  if (isVideo) {
    const source = Buffer.from(await file.arrayBuffer());
    if (!looksLikeVideo(source)) {
      return NextResponse.json(
        { error: "That file is not a readable video. Try exporting it again as MP4 or WebM." },
        { status: 400 },
      );
    }

    filename = `${id}.${VIDEO_EXTENSIONS[file.type]}`;
    mimeType = file.type;

    if (isCloudinaryConfigured()) {
      try {
        const uploaded = await uploadToCloudinary({
          buffer: source,
          mimeType: file.type,
          publicId: id,
          resourceType: "video",
        });
        if (uploaded) {
          url = compressedVideoUrl(uploaded.publicId) ?? uploaded.url;
          publicId = uploaded.publicId;
          width = uploaded.width;
          height = uploaded.height;
          size = uploaded.bytes;
          mimeType = "video/mp4";
        } else {
          url = `/uploads/${filename}`;
        }
      } catch (error) {
        console.error("Cloudinary video upload failed", error);
        return NextResponse.json(
          { error: "Video storage is unavailable right now. Please try again." },
          { status: 502 },
        );
      }
    } else {
      url = `/uploads/${filename}`;
    }

    if (!publicId) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), source);
      } catch (error) {
        console.error("Local video upload failed", error);
        return NextResponse.json(
          { error: "Could not save the video. Please try again." },
          { status: 500 },
        );
      }
    }
  } else {
    filename = `${id}.webp`;
    mimeType = "image/webp";

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

    url = `/uploads/${filename}`;
    width = processed.width;
    height = processed.height;
    size = processed.data.length;

    if (isCloudinaryConfigured()) {
      try {
        const uploaded = await uploadToCloudinary({
          buffer: processed.data,
          mimeType,
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
      mimeType,
    },
  });

  revalidatePath("/admin/media");
  if (media.published) {
    revalidatePath("/photos");
    revalidatePath("/");
  }

  return NextResponse.json({ ok: true, media });
}
