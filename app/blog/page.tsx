import { sanityClient } from '@/lib/sanity/client'
import { FEATURED_POST, LATEST_POST, FILTERED_POSTS } from '@/lib/sanity/queries'
import { Post } from '@/lib/sanity/types'
import BlogCard from '@/src/components/blog/BlogCard'
import EmptyBlogState from '@/src/components/blog/EmptyBlogState'
import { SitePage } from '@/components/site/blocks'
import FeaturedFullWidth from '@/src/components/blog/FeaturedFullWidth'
import { appName } from '@/data/constants/app_name'

export const revalidate = 60

function parseSearchParams(searchParams: { [k: string]: string | string[] | undefined }) {
  const get = (k: string) => (Array.isArray(searchParams[k]) ? searchParams[k]?.[0] : searchParams[k])
  return {
    category: get('category') || undefined,
    author: get('author') || undefined,
    search: get('search') || undefined,
    page: get('page') ? Number(get('page')) : 1,
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> | { [k: string]: string | string[] | undefined } }) {
  const resolved = (searchParams instanceof Promise) ? await searchParams : searchParams
  const filters = parseSearchParams(resolved)

  // If the CMS is unreachable, show the page with a notice instead of crashing.
  let featured: Post | null = null
  let fallbackLatest: Post | null = null
  let posts: Post[] = []
  let unavailable = false
  try {
    ;[featured, fallbackLatest, posts] = await Promise.all([
      sanityClient.fetch<Post | null>(FEATURED_POST),
      sanityClient.fetch<Post | null>(LATEST_POST),
      sanityClient.fetch<Post[]>(FILTERED_POSTS, {
        category: filters.category ?? null,
        author: filters.author ?? null,
        search: filters.search ? `*${filters.search}*` : null,
      }),
    ])
  } catch {
    unavailable = true
  }

  const hero = featured || fallbackLatest || null

  const pageSize = 9
  const page = Math.max(1, filters.page || 1)
  const paged = posts.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(posts.length / pageSize)

  return (
    <SitePage>
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-muted flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="#FDA23A" d="M12.667 3.333v9.334H3.333V3.333zM14 2H2v12h12zm-2.667 9.333H4.667v-.666h6.666zm0-1.333H4.667v-.667h6.666zm0-2H4.667V4.667h6.666z"></path></svg>
          </div>
          <span className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-600">Blog</span>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-ink">Updates On {appName}</h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg text-muted-foreground">News, ideas and perspectives from our team and the ecosystem.</p>
        </header>
        {unavailable ? (
          <div className="rounded-[var(--radius-card)] border border-line bg-canvas p-10 text-center">
            <p className="font-semibold text-ink">We couldn&apos;t load the latest posts</p>
            <p className="mt-1 text-ink-soft">Please refresh the page in a moment.</p>
          </div>
        ) : (
        <>
        <section className="mb-12">
          <FeaturedFullWidth post={hero} />
        </section>
        <section>
          {paged.length === 0 ? (
            <EmptyBlogState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {paged.map((p: Post) => (
                <BlogCard key={p._id} post={p} />
              ))}
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <a className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-line ${page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-canvas'}`} href={`/blog?${new URLSearchParams({ ...(filters.category ? { category: filters.category } : {}), ...(filters.author ? { author: filters.author } : {}), ...(filters.search ? { search: String(filters.search) } : {}), page: String(page - 1) }).toString()}`}>Prev</a>
              <span className="px-2 text-sm text-ink-soft">Page {page} of {totalPages}</span>
              <a className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-line ${page >= totalPages ? 'pointer-events-none opacity-40' : 'hover:bg-canvas'}`} href={`/blog?${new URLSearchParams({ ...(filters.category ? { category: filters.category } : {}), ...(filters.author ? { author: filters.author } : {}), ...(filters.search ? { search: String(filters.search) } : {}), page: String(page + 1) }).toString()}`}>Next</a>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </SitePage>
  )
}
