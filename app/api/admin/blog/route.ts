import { NextResponse } from "next/server";
import { sanityWriter } from "@/lib/server/sanity_write";
import { blogGuard, errorJson, postInput, refreshBlog, slugify, uniqueSlug } from "@/lib/server/blog_admin";

// GET  /api/admin/blog — every post (published and drafts), plus authors and categories.
// POST /api/admin/blog — save a post as a draft, or publish it.

type Row = { _id: string; title?: string; slug?: string; publishedAt?: string; _updatedAt: string; author?: string; category?: string; featured?: boolean };

export async function GET(request: Request) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const client = sanityWriter();
  const [rows, authors, categories] = await Promise.all([
    client.fetch<Row[]>(`*[_type == "post"]{_id, title, "slug": slug.current, publishedAt, _updatedAt, featured, "author": author->name, "category": category->title}`),
    client.fetch<Array<{ _id: string; name: string }>>(`*[_type == "author" && !(_id in path("drafts.**"))] | order(name asc){_id, name}`),
    client.fetch<Array<{ _id: string; title: string }>>(`*[_type == "category" && !(_id in path("drafts.**"))] | order(title asc){_id, title}`),
  ]);
  // A post can exist as published, as a draft, or both (published with unpublished changes).
  const byId = new Map<string, { published?: Row; draft?: Row }>();
  for (const r of rows) {
    const draft = r._id.startsWith("drafts.");
    const id = draft ? r._id.slice(7) : r._id;
    byId.set(id, { ...byId.get(id), [draft ? "draft" : "published"]: r });
  }
  const posts = [...byId.entries()]
    .map(([id, v]) => {
      const r = v.draft ?? v.published!;
      return {
        id,
        title: r.title || "Untitled",
        slug: v.published?.slug ?? r.slug ?? null,
        status: v.published ? (v.draft ? "changed" : "published") : "draft",
        publishedAt: v.published?.publishedAt ?? null,
        updatedAt: r._updatedAt,
        author: r.author ?? null,
        category: r.category ?? null,
        featured: Boolean(r.featured),
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ posts, authors, categories });
}

export async function POST(request: Request) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const parsed = postInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the post and try again.");
  const input = parsed.data;
  if (input.mainImageRef && !input.imageAlt) return errorJson(400, "VALIDATION_ERROR", "Describe the cover image for people who can't see it.");

  const client = sanityWriter();
  const id = input.id ?? crypto.randomUUID().replace(/-/g, "");
  const [published, draft] = await Promise.all([client.getDocument(id), client.getDocument(`drafts.${id}`)]);
  if ((published && published._type !== "post") || (draft && draft._type !== "post")) return errorJson(400, "VALIDATION_ERROR", "That isn't a blog post.");
  const [author, category] = await Promise.all([client.getDocument(input.authorId), client.getDocument(input.categoryId)]);
  if (author?._type !== "author") return errorJson(400, "VALIDATION_ERROR", "Choose an author.");
  if (category?._type !== "category") return errorJson(400, "VALIDATION_ERROR", "Choose a category.");

  const slug = await uniqueSlug(input.slug || (published?.slug as { current?: string } | undefined)?.current || slugify(input.title), id);
  const now = new Date().toISOString();
  const doc: { _type: string } & Record<string, unknown> = {
    _type: "post",
    title: input.title,
    slug: { _type: "slug", current: slug },
    excerpt: input.excerpt || undefined,
    ...(input.mainImageRef ? { mainImage: { _type: "image", asset: { _type: "reference", _ref: input.mainImageRef } }, imageAlt: input.imageAlt } : { imageAlt: input.imageAlt || input.title }),
    author: { _type: "reference", _ref: input.authorId },
    category: { _type: "reference", _ref: input.categoryId },
    publishedAt: (published?.publishedAt as string | undefined) ?? (draft?.publishedAt as string | undefined) ?? now,
    updatedAt: now,
    featured: input.featured,
    tags: input.tags,
    body: input.body,
    seoTitle: input.seoTitle || undefined,
    seoDescription: input.seoDescription || undefined,
  };

  if (input.publish) {
    await client.transaction().createOrReplace({ _id: id, ...doc }).delete(`drafts.${id}`).commit();
    refreshBlog(slug);
  } else {
    await client.createOrReplace({ _id: `drafts.${id}`, ...doc });
  }
  return NextResponse.json({ id, slug, status: input.publish ? "published" : published ? "changed" : "draft" });
}
