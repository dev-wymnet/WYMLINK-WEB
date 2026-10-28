"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IcArrowLeft,
  IcCode,
  IcImage,
  IcLink,
  IcListBullets,
  IcListNumbers,
  IcParagraph,
  IcQuote,
  IcTextBold,
  IcTextH2,
  IcTextH3,
  IcTextItalic,
  IcTextUnderline,
  IcTrash,
} from "@/components/app/icons";
import { Alert, Badge, Button, Card, Field, Skeleton } from "@/components/app/ui";
import { errorMessage } from "@/lib/api/client";
import { blogApi, type BlogPost, type BlogStatus } from "@/lib/api/admin";
import { blocksToHtml, htmlToBlocks, imageUrl, type BodyBlock } from "@/lib/blog/portable";
import { useAdmin } from "@/features/admin/admin_context";

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const img = (ref: string, w = 1200) => imageUrl(ref, PROJECT, DATASET, w);

const STATUS: Record<BlogStatus, { label: string; tone: "ok" | "neutral" | "warn" }> = {
  published: { label: "On the site", tone: "ok" },
  draft: { label: "Draft", tone: "neutral" },
  changed: { label: "Unpublished changes", tone: "warn" },
};

type Option = { id: string; name: string };
type Form = Omit<BlogPost, "id" | "status" | "publishedAt" | "body">;
const EMPTY: Form = { title: "", slug: "", excerpt: "", mainImageRef: null, imageAlt: "", authorId: null, categoryId: null, featured: false, tags: [], seoTitle: "", seoDescription: "" };

// Text styling in the editor, close to how the article renders on the site.
const PROSE =
  "min-h-[420px] px-1 text-[17px] leading-[1.75] text-ink outline-none [&_a]:text-brand-600 [&_a]:underline [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-200 [&_blockquote]:pl-4 [&_blockquote]:text-ink-soft [&_code]:rounded [&_code]:bg-canvas [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_figure]:my-6 [&_figure_img]:w-full [&_figure_img]:rounded-2xl [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mt-5 [&_h4]:font-semibold [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:text-slate-100 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6";

function Tool({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // Keep the text selection in the editor.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-lg text-lg text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
    >
      {children}
    </button>
  );
}

function Editor() {
  const router = useRouter();
  const params = useSearchParams();
  const { admin } = useAdmin();
  const allowed = admin?.role === "super_admin" || admin?.role === "business_admin";
  const [id, setId] = useState<string | null>(params.get("id"));
  const [status, setStatus] = useState<BlogStatus | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [initialBody, setInitialBody] = useState<string | null>(id ? null : "<p><br></p>");
  const [authors, setAuthors] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // Where the next uploaded picture goes: into the text, or the cover.
  const [uploadTo, setUploadTo] = useState<"body" | "cover">("cover");

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  useEffect(() => {
    if (!allowed) return;
    blogApi
      .list()
      .then((r) => {
        setAuthors(r.authors.map((a) => ({ id: a._id, name: a.name })));
        setCategories(r.categories.map((c) => ({ id: c._id, name: c.title })));
      })
      .catch((e) => setError(errorMessage(e)));
    if (!id) return;
    blogApi
      .get(id)
      .then(({ post }) => {
        const { status: s, body: b } = post;
        setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, mainImageRef: post.mainImageRef, imageAlt: post.imageAlt, authorId: post.authorId, categoryId: post.categoryId, featured: post.featured, tags: post.tags, seoTitle: post.seoTitle, seoDescription: post.seoDescription });
        setStatus(s);
        setInitialBody(blocksToHtml(b as BodyBlock[], (ref) => img(ref)));
      })
      .catch((e) => setError(errorMessage(e)));
    // Load once per post.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  // Fill the editor once the post has loaded; after that the browser owns its content.
  useEffect(() => {
    if (initialBody !== null && body.current && !body.current.dataset.ready) {
      body.current.innerHTML = initialBody;
      body.current.dataset.ready = "1";
    }
  }, [initialBody]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const stop = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", stop);
    return () => window.removeEventListener("beforeunload", stop);
  }, [dirty]);

  const exec = useCallback((command: string, value?: string) => {
    body.current?.focus();
    document.execCommand(command, false, value);
    setDirty(true);
  }, []);

  const addLink = () => {
    const url = window.prompt("Link address (https://…)");
    if (!url) return;
    if (!/^(https?:\/\/|mailto:|\/)/i.test(url.trim())) return setError("Links must start with https://, mailto: or /");
    exec("createLink", url.trim());
  };

  const upload = async (file: File) => {
    setBusy("upload");
    setError(null);
    try {
      const { ref } = await blogApi.upload(file);
      if (uploadTo === "body") {
        const alt = (window.prompt("Describe the picture for people who can't see it") ?? "").replace(/"/g, "&quot;");
        exec("insertHTML", `<figure data-asset="${ref}" contenteditable="false"><img src="${img(ref)}" alt="${alt}"></figure><p><br></p>`);
      } else set("mainImageRef", ref);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const addMeta = async (kind: "author" | "category") => {
    const name = window.prompt(kind === "author" ? "Author's name" : "Category name");
    if (!name?.trim()) return;
    try {
      const r = await blogApi.addMeta(kind, name.trim());
      if (kind === "author") {
        setAuthors((a) => (a.some((x) => x.id === r.id) ? a : [...a, { id: r.id, name: r.name }]));
        set("authorId", r.id);
      } else {
        setCategories((c) => (c.some((x) => x.id === r.id) ? c : [...c, { id: r.id, name: r.name }]));
        set("categoryId", r.id);
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const save = async (publish: boolean) => {
    if (!body.current) return;
    if (!form.title.trim()) return setError("Give the post a title.");
    if (!form.categoryId) return setError("Choose a category.");
    if (!form.authorId) return setError("Choose an author.");
    const blocks = htmlToBlocks(body.current);
    if (!blocks.length) return setError("Write something in the post first.");
    setBusy(publish ? "publish" : "draft");
    setError(null);
    setSaved(null);
    try {
      const r = await blogApi.save({ ...form, ...(id ? { id } : {}), authorId: form.authorId, categoryId: form.categoryId, body: blocks, publish });
      setId(r.id);
      setStatus(r.status);
      setForm((f) => ({ ...f, slug: r.slug }));
      setDirty(false);
      setSaved(publish ? "Published. It shows on the blog within a minute." : "Draft saved. It isn't on the site until you publish it.");
      if (!id) router.replace(`/admin/blog/edit?id=${encodeURIComponent(r.id)}`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const action = async (what: "unpublish" | "discard" | "delete") => {
    if (!id) return;
    const ask = { unpublish: "Take this post off the site? It stays here as a draft.", discard: "Throw away the changes that aren't published yet?", delete: "Delete this post for good? This can't be undone." }[what];
    if (!window.confirm(ask)) return;
    setBusy(what);
    setError(null);
    try {
      if (what === "delete") {
        await blogApi.remove(id);
        setDirty(false);
        router.replace("/admin/blog");
        return;
      }
      setStatus((await blogApi.action(id, what)).status);
      if (what === "discard") window.location.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (!allowed) return <Alert tone="bad" title="Not available for your role">Super admins and business admins write the blog.</Alert>;
  if (error && error.includes("SANITY_API_WRITE_TOKEN")) return <Alert tone="warn" title="Blog writing isn't switched on yet">{error}</Alert>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink">
          <IcArrowLeft aria-hidden /> All posts
        </Link>
        <div className="flex items-center gap-3">
          {status && <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>}
          {status && status !== "draft" && form.slug && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-600 hover:underline">
              View on site
            </a>
          )}
        </div>
      </div>

      {error && <Alert tone="bad">{error}</Alert>}
      {saved && !error && <Alert tone="ok">{saved}</Alert>}

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card flush className="overflow-hidden">
          {initialBody === null ? (
            <Skeleton className="m-6 h-96" />
          ) : (
            <>
              <div className="px-6 pt-6 sm:px-10 sm:pt-8">
                <label htmlFor="post-title" className="sr-only">
                  Title
                </label>
                <textarea
                  id="post-title"
                  rows={1}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value.replace(/\n/g, ""))}
                  placeholder="Post title"
                  className="w-full resize-none bg-transparent text-[34px] font-semibold leading-tight tracking-[-0.03em] text-ink outline-none placeholder:text-ink-faint [field-sizing:content]"
                />
              </div>
              <div className="sticky top-0 z-10 mt-3 flex flex-wrap items-center gap-0.5 border-y border-line bg-white px-4 py-1.5 sm:px-8" role="toolbar" aria-label="Formatting">
                <Tool label="Paragraph" onClick={() => exec("formatBlock", "<p>")}>
                  <IcParagraph />
                </Tool>
                <Tool label="Heading" onClick={() => exec("formatBlock", "<h2>")}>
                  <IcTextH2 />
                </Tool>
                <Tool label="Subheading" onClick={() => exec("formatBlock", "<h3>")}>
                  <IcTextH3 />
                </Tool>
                <span className="mx-1 h-6 w-px bg-line" />
                <Tool label="Bold" onClick={() => exec("bold")}>
                  <IcTextBold />
                </Tool>
                <Tool label="Italic" onClick={() => exec("italic")}>
                  <IcTextItalic />
                </Tool>
                <Tool label="Underline" onClick={() => exec("underline")}>
                  <IcTextUnderline />
                </Tool>
                <Tool label="Link" onClick={addLink}>
                  <IcLink />
                </Tool>
                <span className="mx-1 h-6 w-px bg-line" />
                <Tool label="Bulleted list" onClick={() => exec("insertUnorderedList")}>
                  <IcListBullets />
                </Tool>
                <Tool label="Numbered list" onClick={() => exec("insertOrderedList")}>
                  <IcListNumbers />
                </Tool>
                <Tool label="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>
                  <IcQuote />
                </Tool>
                <Tool label="Code block" onClick={() => exec("formatBlock", "<pre>")}>
                  <IcCode />
                </Tool>
                <Tool
                  label="Picture"
                  onClick={() => {
                    setUploadTo("body");
                    fileInput.current?.click();
                  }}
                >
                  <IcImage />
                </Tool>
                {busy === "upload" && <span className="ml-2 text-sm text-ink-soft">Uploading…</span>}
              </div>
              <div className="px-6 py-6 sm:px-10">
                <div ref={body} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Post" onInput={() => setDirty(true)} className={PROSE} />
              </div>
            </>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <div className="flex flex-col gap-2">
              <Button block loading={busy === "publish"} disabled={!!busy} onClick={() => save(true)}>
                {status === "published" || status === "changed" ? "Update on site" : "Publish"}
              </Button>
              <Button block variant="secondary" loading={busy === "draft"} disabled={!!busy} onClick={() => save(false)}>
                Save draft
              </Button>
              {dirty && <p className="text-center text-xs text-ink-faint">You have unsaved changes.</p>}
            </div>
            {id && (
              <div className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-sm">
                {(status === "published" || status === "changed") && (
                  <button type="button" disabled={!!busy} onClick={() => action("unpublish")} className="py-1 text-left font-medium text-ink-soft hover:text-ink">
                    Take off the site
                  </button>
                )}
                {status === "changed" && (
                  <button type="button" disabled={!!busy} onClick={() => action("discard")} className="py-1 text-left font-medium text-ink-soft hover:text-ink">
                    Discard unpublished changes
                  </button>
                )}
                <button type="button" disabled={!!busy} onClick={() => action("delete")} className="inline-flex items-center gap-2 py-1 text-left font-medium text-bad hover:underline">
                  <IcTrash aria-hidden /> Delete post
                </button>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-ink">Cover picture</h2>
            {form.mainImageRef ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img(form.mainImageRef, 680)} alt={form.imageAlt} className="mt-3 aspect-video w-full rounded-2xl object-cover" />
            ) : (
              <p className="mt-1 text-sm text-ink-soft">Shown at the top of the post and on the blog page.</p>
            )}
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                loading={busy === "upload" && uploadTo === "cover"}
                onClick={() => {
                  setUploadTo("cover");
                  fileInput.current?.click();
                }}
              >
                {form.mainImageRef ? "Change" : "Upload"}
              </Button>
              {form.mainImageRef && (
                <Button size="sm" variant="ghost" onClick={() => set("mainImageRef", null)}>
                  Remove
                </Button>
              )}
            </div>
            {form.mainImageRef && (
              <Field className="mt-3" label="Describe the picture" value={form.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} placeholder="e.g. A trader paying with her phone at a market stall" />
            )}
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <Picker label="Category" value={form.categoryId} options={categories} onChange={(v) => set("categoryId", v)} onAdd={() => addMeta("category")} />
              <Picker label="Author" value={form.authorId} options={authors} onChange={(v) => set("authorId", v)} onAdd={() => addMeta("author")} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="excerpt" className="text-sm font-medium text-ink">
                  Summary
                </label>
                <textarea
                  id="excerpt"
                  rows={3}
                  maxLength={400}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="One or two sentences shown on the blog page."
                  className="rounded-2xl border border-transparent bg-canvas px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </div>
              <Field
                label="Tags"
                value={form.tags.join(", ")}
                onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12))}
                placeholder="payments, savings"
                hint="Separate with commas."
              />
              <label className="flex items-center gap-3 text-sm font-medium text-ink">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-brand-600" />
                Feature at the top of the blog
              </label>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-ink">Search and sharing</h2>
            <div className="mt-3 flex flex-col gap-4">
              <Field label="Web address" prefix="/blog/" value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="made from the title" />
              <Field label="Search title" value={form.seoTitle} maxLength={120} onChange={(e) => set("seoTitle", e.target.value)} placeholder="Defaults to the post title" />
              <Field label="Search description" value={form.seoDescription} maxLength={300} onChange={(e) => set("seoDescription", e.target.value)} placeholder="Defaults to the summary" />
            </div>
          </Card>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(f);
        }}
      />
    </div>
  );
}

function Picker({ label, value, options, onChange, onAdd }: { label: string; value: string | null; options: Option[]; onChange: (v: string) => void; onAdd: () => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={`pick-${label}`} className="text-sm font-medium text-ink">
          {label}
        </label>
        <button type="button" onClick={onAdd} className="text-sm font-medium text-brand-600 hover:underline">
          Add new
        </button>
      </div>
      <select
        id={`pick-${label}`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl border border-transparent bg-canvas px-4 text-[15px] text-ink outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
      >
        <option value="" disabled>
          Choose…
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
