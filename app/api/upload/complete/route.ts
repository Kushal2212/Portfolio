import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { compressedVideoUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

type UploadResult = {
  id?: unknown;
  publicId?: unknown;
  bytes?: unknown;
  width?: unknown;
  height?: unknown;
  published?: unknown;
};

function positiveInt(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : null;
}

/**
 * Records a video that the browser uploaded directly to Cloudinary. The
 * delivered URL is generated here with a compression transformation, and the
 * public id is checked against the id issued by /api/upload/sign.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimit(`upload-complete:${getClientIp(request.headers)}`, 30, 60_000).success) {
    return NextResponse.json({ error: "Too many uploads. Slow down a little." }, { status: 429 });
  }

  let body: UploadResult;
  try {
    body = (await request.json()) as UploadResult;
  } catch {
    return NextResponse.json({ error: "Could not read the upload details." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) {
    return NextResponse.json({ error: "Invalid upload reference." }, { status: 400 });
  }

  const publicId = typeof body.publicId === "string" ? body.publicId : "";
  if (publicId !== `portfolio/${id}`) {
    return NextResponse.json({ error: "Upload reference does not match." }, { status: 400 });
  }

  const bytes = positiveInt(body.bytes);
  if (bytes !== null && bytes > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: "Videos must be 100 MB or smaller." }, { status: 400 });
  }

  const url = compressedVideoUrl(publicId);
  if (!url) {
    return NextResponse.json({ error: "Video storage is unavailable." }, { status: 503 });
  }

  const filename = `${id}.mp4`;
  const media = await prisma.media.create({
    data: {
      url,
      publicId,
      filename,
      altText: id.replace(/-[a-z0-9]{8}$/i, "").replace(/-/g, " "),
      published: body.published === true,
      size: bytes ?? 0,
      width: positiveInt(body.width),
      height: positiveInt(body.height),
      mimeType: "video/mp4",
    },
  });

  revalidatePath("/admin/media");
  if (media.published) {
    revalidatePath("/photos");
    revalidatePath("/");
  }

  return NextResponse.json({ ok: true, media });
}
