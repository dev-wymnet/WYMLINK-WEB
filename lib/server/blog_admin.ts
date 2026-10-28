import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isSameOrigin } from "@/lib/server/session";
import { canWriteBlog, currentAdmin, type CurrentAdmin } from "@/lib/server/admin_auth";
import { blogWritingConfigured, sanityWriter } from "@/lib/server/sanity_write";
import { bodySchema, IMAGE_REF } from "@/lib/blog/portable";

// Shared by the admin console's blog API routes (/api/admin/blog/*).

export const errorJson = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message } }, { status });

// Signed-in staff allowed to write the blog, or the response to send instead.
export async function blogGuard(request: Request): Promise<{ admin: CurrentAdmin } | { response: NextResponse }> {
  if (request.method !== "GET" && !isSameOrigin(request)) return { response: errorJson(403, "FORBIDDEN", "Request blocked") };
  const admin = await currentAdmin(request);
  if (!admin) return { response: errorJson(401, "UNAUTHORIZED", "Please sign in again.") };
  if (!canWriteBlog(admin)) return { response: errorJson(403, "FORBIDDEN", "Your admin role can't write blog posts.") };
  if (!blogWritingConfigured()) {
    return { response: errorJson(503, "BLOG_NOT_CONFIGURED", "Blog writing isn't switched on yet: the website needs SANITY_API_WRITE_TOKEN.") };
  }
  return { admin };
}

export const DOC_ID = /^[A-Za-z0-9_-]{1,64}$/;
const refId = z.string().regex(DOC_ID);

export const postInput = z.object({
  id: refId.optional(),
  title: z.string().trim().min(1, "Give the post a title").max(200),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "The web address can use lowercase letters, numbers and dashes")
    .optional()
    .or(z.literal("")),
  excerpt: z.string().trim().max(400).optional(),
  mainImageRef: z.string().regex(IMAGE_REF).nullable().optional(),
  imageAlt: z.string().trim().max(300).optional(),
  authorId: refId,
  categoryId: refId,
  featured: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(300).optional(),
  body: bodySchema.min(1, "Write something in the post first"),
  publish: z.boolean(),
});

export const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "post";

// A web address no other post uses.
export async function uniqueSlug(base: string, id: string) {
  const taken = await sanityWriter().fetch<string[]>(`*[_type == "post" && slug.current match $prefix && !(_id in [$id, $draft])].slug.current`, {
    prefix: `${base}*`,
    id,
    draft: `drafts.${id}`,
  });
  if (!taken.includes(base)) return base;
  for (let n = 2; ; n++) if (!taken.includes(`${base}-${n}`)) return `${base}-${n}`;
}

export function refreshBlog(slug?: string) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}
