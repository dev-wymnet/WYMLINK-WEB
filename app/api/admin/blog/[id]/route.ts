import { NextResponse } from "next/server";
import { sanityWriter } from "@/lib/server/sanity_write";
import { blogGuard, DOC_ID, errorJson, refreshBlog } from "@/lib/server/blog_admin";

// GET    /api/admin/blog/<id> — the post to edit (its draft if there is one).
// POST   /api/admin/blog/<id> {action: "unpublish" | "discard"} — take it off the site, or drop unpublished changes.
// DELETE /api/admin/blog/<id> — delete it everywhere.

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
  const client = sanityWriter();
  const [published, draft] = await Promise.all([client.getDocument(id), client.getDocument(`drafts.${id}`)]);
  if ((published && published._type !== "post") || (draft && draft._type !== "post")) return null;
  return { published, draft };
}

export async function GET(request: Request, { params }: Params) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const { id } = await params;
  if (!DOC_ID.test(id)) return errorJson(404, "NOT_FOUND", "Post not found");
  const found = await load(id);
  const doc = found?.draft ?? found?.published;
  if (!found || !doc) return errorJson(404, "NOT_FOUND", "Post not found");
  const ref = (o: unknown) => (o as { _ref?: string } | undefined)?._ref ?? null;
  return NextResponse.json({
    post: {
      id,
      status: found.published ? (found.draft ? "changed" : "published") : "draft",
      title: doc.title ?? "",
      slug: (doc.slug as { current?: string } | undefined)?.current ?? "",
      excerpt: doc.excerpt ?? "",
      mainImageRef: ref((doc.mainImage as { asset?: unknown } | undefined)?.asset),
      imageAlt: doc.imageAlt ?? "",
      authorId: ref(doc.author),
      categoryId: ref(doc.category),
      featured: Boolean(doc.featured),
      tags: (doc.tags as string[] | undefined) ?? [],
      seoTitle: doc.seoTitle ?? "",
      seoDescription: doc.seoDescription ?? "",
      body: doc.body ?? [],
      publishedAt: found.published?.publishedAt ?? null,
    },
  });
}

export async function POST(request: Request, { params }: Params) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const { id } = await params;
  const { action } = ((await request.json().catch(() => ({}))) ?? {}) as { action?: string };
  if (!DOC_ID.test(id)) return errorJson(404, "NOT_FOUND", "Post not found");
  const found = await load(id);
  if (!found || (!found.published && !found.draft)) return errorJson(404, "NOT_FOUND", "Post not found");
  const client = sanityWriter();
  const slug = (found.published?.slug as { current?: string } | undefined)?.current;

  if (action === "unpublish") {
    if (!found.published) return errorJson(400, "VALIDATION_ERROR", "This post isn't on the site.");
    // The newest content (draft if any) becomes the draft; system fields are rewritten by Sanity.
    const fields = Object.fromEntries(Object.entries(found.draft ?? found.published).filter(([k]) => !k.startsWith("_")));
    await client.transaction().createOrReplace({ ...fields, _id: `drafts.${id}`, _type: "post" }).delete(id).commit();
    refreshBlog(slug);
    return NextResponse.json({ status: "draft" });
  }
  if (action === "discard") {
    if (!found.published || !found.draft) return errorJson(400, "VALIDATION_ERROR", "There are no unpublished changes.");
    await client.delete(`drafts.${id}`);
    return NextResponse.json({ status: "published" });
  }
  return errorJson(400, "VALIDATION_ERROR", "Unknown action");
}

export async function DELETE(request: Request, { params }: Params) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const { id } = await params;
  if (!DOC_ID.test(id)) return errorJson(404, "NOT_FOUND", "Post not found");
  const found = await load(id);
  if (!found || (!found.published && !found.draft)) return errorJson(404, "NOT_FOUND", "Post not found");
  const slug = (found.published?.slug as { current?: string } | undefined)?.current;
  let tx = sanityWriter().transaction();
  if (found.published) tx = tx.delete(id);
  if (found.draft) tx = tx.delete(`drafts.${id}`);
  await tx.commit();
  refreshBlog(slug);
  return new NextResponse(null, { status: 204 });
}
