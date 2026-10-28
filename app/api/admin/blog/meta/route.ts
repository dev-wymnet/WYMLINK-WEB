import { NextResponse } from "next/server";
import { z } from "zod";
import { sanityWriter } from "@/lib/server/sanity_write";
import { blogGuard, errorJson, slugify } from "@/lib/server/blog_admin";

// POST /api/admin/blog/meta {kind: "author" | "category", name} — add an author or category.

const input = z.object({ kind: z.enum(["author", "category"]), name: z.string().trim().min(2, "Enter a name").max(80) });

export async function POST(request: Request) {
  const g = await blogGuard(request);
  if ("response" in g) return g.response;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Check the name");
  const { kind, name } = parsed.data;
  const client = sanityWriter();
  const field = kind === "author" ? "name" : "title";
  const existing = await client.fetch<{ _id: string } | null>(`*[_type == $kind && lower(${field}) == lower($name) && !(_id in path("drafts.**"))][0]{_id}`, { kind, name });
  if (existing) return NextResponse.json({ id: existing._id, name });
  const doc = await client.create({ _type: kind, [field]: name, slug: { _type: "slug", current: slugify(name) } });
  return NextResponse.json({ id: doc._id, name });
}
