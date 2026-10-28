import { NextResponse } from "next/server";
import { sanityWriter } from "@/lib/server/sanity_write";
import { blogGuard, errorJson } from "@/lib/server/blog_admin";

// POST /api/admin/blog/image (multipart "file") — upload a picture for a post.

const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

// The first bytes of each allowed format, so a renamed file of another kind is refused.
function looksLikeImage(b: Uint8Array) {
  const at = (i: number, ...xs: number[]) => xs.every((x, j) => b[i + j] === x);
  return at(0, 0xff, 0xd8, 0xff) || at(0, 0x89, 0x50, 0x4e, 0x47) || at(0, 0x47, 0x49, 0x46, 0x38) || (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50));
}

export async function POST(request: Request) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return errorJson(400, "VALIDATION_ERROR", "Choose a picture to upload.");
  if (!TYPES.has(file.type)) return errorJson(400, "VALIDATION_ERROR", "Use a JPG, PNG, WebP or GIF picture.");
  if (file.size > MAX_BYTES) return errorJson(413, "PAYLOAD_TOO_LARGE", "Pictures can be up to 8 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(bytes)) return errorJson(400, "VALIDATION_ERROR", "That file isn't a picture.");
  const asset = await sanityWriter().assets.upload("image", bytes, { filename: file.name.slice(0, 120), contentType: file.type });
  return NextResponse.json({ ref: asset._id, url: asset.url });
}
