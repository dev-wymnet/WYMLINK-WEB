"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IcDocument, IcPlus } from "@/components/app/icons";
import { Alert, Badge, Button, Card, Empty, PageHeader, Skeleton } from "@/components/app/ui";
import { ApiError, errorMessage } from "@/lib/api/client";
import { blogApi, type BlogRow, type BlogStatus } from "@/lib/api/admin";
import { useAdmin } from "@/features/admin/admin_context";

const STATUS: Record<BlogStatus, { label: string; tone: "ok" | "neutral" | "warn" }> = {
  published: { label: "On the site", tone: "ok" },
  draft: { label: "Draft", tone: "neutral" },
  changed: { label: "Unpublished changes", tone: "warn" },
};

const when = (iso: string) => new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export default function BlogPage() {
  const { admin } = useAdmin();
  const [posts, setPosts] = useState<BlogRow[] | null>(null);
  const [error, setError] = useState<{ message: string; setup: boolean } | null>(null);
  const allowed = admin?.role === "super_admin" || admin?.role === "business_admin";

  useEffect(() => {
    if (!allowed) return;
    blogApi
      .list()
      .then((r) => setPosts(r.posts))
      .catch((e) => setError({ message: errorMessage(e), setup: e instanceof ApiError && e.code === "BLOG_NOT_CONFIGURED" }));
  }, [allowed]);

  if (!allowed) return <Alert tone="bad" title="Not available for your role">Super admins and business admins write the blog.</Alert>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blog"
        subtitle="Articles on wymlink's website. Published posts appear on the blog within a minute."
        action={
          <Button href="/admin/blog/edit">
            <IcPlus aria-hidden /> New post
          </Button>
        }
      />
      {error &&
        (error.setup ? (
          <Alert tone="warn" title="Blog writing isn't switched on yet">
            The website needs a Sanity write token. In sanity.io/manage, open the Wymlink project → API → Tokens → Add API token with Editor rights, and set it as SANITY_API_WRITE_TOKEN where the website runs.
          </Alert>
        ) : (
          <Alert tone="bad">{error.message}</Alert>
        ))}
      {!error && !posts ? (
        <Skeleton className="h-64" />
      ) : posts && posts.length === 0 ? (
        <Card>
          <Empty icon={<IcDocument />} title="No posts yet" body="Write the first article for the blog." />
        </Card>
      ) : posts ? (
        <Card flush>
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/blog/edit?id=${encodeURIComponent(p.id)}`} className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors hover:bg-canvas">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{p.title}</p>
                    <p className="truncate text-sm text-ink-soft">
                      {[p.category, p.author, `edited ${when(p.updatedAt)}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {p.featured && <Badge tone="info">Featured</Badge>}
                  <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
