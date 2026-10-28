import { z } from "zod";

// A blog post body in Sanity's Portable Text, as the admin console's editor reads and writes
// it: paragraphs, headings, quotes, bullet and numbered lists, bold/italic/underline/inline
// code, links, images and code blocks.

const key = z.string().regex(/^[A-Za-z0-9_-]{1,40}$/);
const MARKS = ["strong", "em", "underline", "code"] as const;
const STYLES = ["normal", "h2", "h3", "h4", "blockquote"] as const;
export const IMAGE_REF = /^image-[a-f0-9]{20,64}-\d{1,5}x\d{1,5}-(jpg|jpeg|png|webp|gif)$/;

const span = z.object({ _type: z.literal("span"), _key: key, text: z.string().max(20_000), marks: z.array(key.or(z.enum(MARKS))).max(8) });
const link = z.object({ _type: z.literal("link"), _key: key, href: z.string().max(2000).regex(/^(https?:\/\/|mailto:|\/)/i, "Links must start with https://, mailto: or /") });
const block = z.object({
  _type: z.literal("block"),
  _key: key,
  style: z.enum(STYLES),
  listItem: z.enum(["bullet", "number"]).optional(),
  level: z.number().int().min(1).max(4).optional(),
  markDefs: z.array(link).max(50),
  children: z.array(span).min(1).max(500),
});
const image = z.object({
  _type: z.literal("image"),
  _key: key,
  asset: z.object({ _type: z.literal("reference"), _ref: z.string().regex(IMAGE_REF) }),
  alt: z.string().max(300).optional(),
});
const code = z.object({ _type: z.literal("code"), _key: key, code: z.string().max(50_000), language: z.string().max(40).optional() });

export const bodySchema = z.array(z.discriminatedUnion("_type", [block, image, code])).max(2000);
export type BodyBlock = z.infer<typeof bodySchema>[number];

export const newKey = () => Math.random().toString(36).slice(2, 12);

// ---------- Portable Text → editor HTML ----------

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// cdn.sanity.io URL for an image reference ("image-<id>-<w>x<h>-<ext>").
export function imageUrl(ref: string, projectId: string, dataset: string, width = 1200) {
  const m = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  return m ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}?w=${width}&fit=max&auto=format` : "";
}

export function blocksToHtml(blocks: BodyBlock[], img: (ref: string) => string): string {
  let html = "";
  const open: Array<"ul" | "ol"> = [];
  const closeLists = (to = 0) => {
    while (open.length > to) html += `</${open.pop()}>`;
  };
  for (const b of blocks) {
    if (b._type !== "block" || !b.listItem) closeLists();
    if (b._type === "image") {
      html += `<figure data-asset="${esc(b.asset._ref)}" contenteditable="false"><img src="${esc(img(b.asset._ref))}" alt="${esc(b.alt ?? "")}"></figure>`;
      continue;
    }
    if (b._type === "code") {
      html += `<pre data-language="${esc(b.language ?? "text")}">${esc(b.code)}</pre>`;
      continue;
    }
    const inner = b.children
      .map((s) => {
        let t = esc(s.text).replace(/\n/g, "<br>");
        for (const m of s.marks) {
          const def = b.markDefs.find((d) => d._key === m);
          if (def) t = `<a href="${esc(def.href)}">${t}</a>`;
          else if (m === "strong") t = `<strong>${t}</strong>`;
          else if (m === "em") t = `<em>${t}</em>`;
          else if (m === "underline") t = `<u>${t}</u>`;
          else if (m === "code") t = `<code>${t}</code>`;
        }
        return t;
      })
      .join("");
    if (b.listItem) {
      const tag = b.listItem === "number" ? "ol" : "ul";
      const level = b.level ?? 1;
      while (open.length > level) html += `</${open.pop()}>`;
      if (open.length === level && open[level - 1] !== tag) html += `</${open.pop()}>`;
      while (open.length < level) {
        html += `<${tag}>`;
        open.push(tag);
      }
      html += `<li>${inner || "<br>"}</li>`;
      continue;
    }
    const tag = b.style === "normal" ? "p" : b.style;
    html += `<${tag}>${inner || "<br>"}</${tag}>`;
  }
  closeLists();
  return html || "<p><br></p>";
}

// ---------- Editor HTML → Portable Text (browser only) ----------

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Link = { _type: "link"; _key: string; href: string };

function inline(node: Node, marks: string[], spans: Span[], defs: Link[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").replace(/ /g, " ");
    if (!text) return;
    const last = spans.at(-1);
    if (last && last.marks.join() === marks.join()) last.text += text;
    else spans.push({ _type: "span", _key: newKey(), text, marks: [...marks] });
    return;
  }
  if (!(node instanceof HTMLElement)) return;
  const tag = node.tagName;
  if (tag === "BR") return inline(document.createTextNode("\n"), marks, spans, defs);
  let next = marks;
  if (tag === "B" || tag === "STRONG") next = [...marks, "strong"];
  else if (tag === "I" || tag === "EM") next = [...marks, "em"];
  else if (tag === "U") next = [...marks, "underline"];
  else if (tag === "CODE") next = [...marks, "code"];
  else if (tag === "A") {
    const href = node.getAttribute("href") ?? "";
    if (/^(https?:\/\/|mailto:|\/)/i.test(href)) {
      const def = { _type: "link" as const, _key: newKey(), href };
      defs.push(def);
      next = [...marks, def._key];
    }
  }
  for (const child of Array.from(node.childNodes)) inline(child, [...new Set(next)], spans, defs);
}

function textBlock(el: Node, style: (typeof STYLES)[number], list?: { item: "bullet" | "number"; level: number }) {
  const spans: Span[] = [];
  const defs: Link[] = [];
  for (const child of Array.from(el.childNodes)) {
    if (child instanceof HTMLElement && (child.tagName === "UL" || child.tagName === "OL")) continue;
    inline(child, [], spans, defs);
  }
  // Trim a trailing line break the browser leaves at the end of a block.
  const last = spans.at(-1);
  if (last) last.text = last.text.replace(/\n+$/, "");
  const kept = spans.filter((s) => s.text);
  if (!kept.length) return null;
  const used = new Set(kept.flatMap((s) => s.marks));
  return {
    _type: "block" as const,
    _key: newKey(),
    style,
    ...(list ? { listItem: list.item, level: list.level } : {}),
    markDefs: defs.filter((d) => used.has(d._key)),
    children: kept,
  };
}

export function htmlToBlocks(root: HTMLElement): BodyBlock[] {
  const out: BodyBlock[] = [];
  const push = (b: BodyBlock | null) => b && out.push(b);
  const list = (el: HTMLElement, level: number) => {
    const item = el.tagName === "OL" ? "number" : "bullet";
    for (const li of Array.from(el.children)) {
      if (li.tagName !== "LI") continue;
      push(textBlock(li, "normal", { item, level: Math.min(level, 4) }));
      for (const nested of Array.from(li.children)) if (nested.tagName === "UL" || nested.tagName === "OL") list(nested as HTMLElement, level + 1);
    }
  };
  // Browsers nest blocks inside each other while editing (a list inside a paragraph, a
  // paragraph inside a div): a container holding blocks is walked like the root; text
  // around them becomes paragraphs of its own.
  const walk = (container: Node, style: (typeof STYLES)[number]) => {
    let loose: Node[] = [];
    const flush = () => {
      if (!loose.length) return;
      const holder = document.createElement("span");
      for (const n of loose) holder.appendChild(n.cloneNode(true));
      push(textBlock(holder, style));
      loose = [];
    };
    for (const node of Array.from(container.childNodes)) {
      if (!(node instanceof HTMLElement) || (!BLOCK_TAGS.has(node.tagName) && !node.querySelector(BLOCK_SELECTOR))) {
        loose.push(node);
        continue;
      }
      flush();
      const tag = node.tagName;
      if (tag === "UL" || tag === "OL") list(node, 1);
      else if (tag === "FIGURE" || tag === "IMG") {
        const ref = node.getAttribute("data-asset") ?? node.querySelector("[data-asset]")?.getAttribute("data-asset");
        if (ref && IMAGE_REF.test(ref)) out.push({ _type: "image", _key: newKey(), asset: { _type: "reference", _ref: ref }, alt: node.querySelector("img")?.getAttribute("alt") ?? undefined });
      } else if (tag === "PRE") {
        const text = node.textContent ?? "";
        if (text.trim()) out.push({ _type: "code", _key: newKey(), code: text, language: node.getAttribute("data-language") || "text" });
      } else walk(node, HEADING[tag] ?? (tag === "BLOCKQUOTE" ? "blockquote" : style));
    }
    flush();
  };
  walk(root, "normal");
  return out;
}

const HEADING: Record<string, (typeof STYLES)[number]> = { H1: "h2", H2: "h2", H3: "h3", H4: "h4", H5: "h4", H6: "h4" };
const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "UL", "OL", "PRE", "FIGURE", "IMG", "SECTION", "ARTICLE"]);
const BLOCK_SELECTOR = "p,div,h1,h2,h3,h4,h5,h6,blockquote,ul,ol,pre,figure,img";
