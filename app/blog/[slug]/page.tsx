import { sanityClient } from '@/lib/sanity/client'
import { POST_BY_SLUG, RELATED_POSTS } from '@/lib/sanity/queries'
import { Post } from '@/lib/sanity/types'
import ArticleContent from '@/src/components/blog/ArticleContent'
import RelatedArticles from '@/src/components/blog/RelatedArticles'
import { Metadata } from 'next'
import ArticleHeader from '@/src/components/blog/ArticleHeader'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import Link from 'next/link'
import { SitePage } from '@/components/site/blocks'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }): Promise<Metadata> {
  const resolved = (params instanceof Promise) ? await params : params
  const post = await sanityClient.fetch<Post | null>(POST_BY_SLUG, { slug: resolved.slug ?? null }).catch(() => null)
  if (!post) return {}
  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || ''
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/blog/${post.slug.current}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolved = (params instanceof Promise) ? await params : params
  const result = await sanityClient
    .fetch<Post | null>(POST_BY_SLUG, { slug: resolved.slug ?? null })
    .then((post) => ({ post, unavailable: false }))
    .catch(() => ({ post: null as Post | null, unavailable: true }))
  const { post, unavailable } = result
  if (!post) {
    return (
      <SitePage>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-3xl font-semibold text-ink">{unavailable ? "We couldn't load this article" : "Article not found"}</h1>
          <p className="mt-2 text-ink-soft">{unavailable ? "Please refresh the page in a moment." : "This article doesn't exist or isn't published yet."}</p>
          <Link href="/blog" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-5 font-semibold text-white">
            Back to the blog
          </Link>
        </div>
      </SitePage>
    )
  }

  const related = await sanityClient
    .fetch<Post[]>(RELATED_POSTS, { slug: post.slug.current, categoryId: post.category?._id, tags: post.tags || [] })
    .catch(() => [] as Post[])

  return (
    <SitePage>
      <article className="px-5 py-14">
        <div className="mx-auto max-w-5xl">
          <ArticleHeader post={post} />
        </div>

        {post.mainImage && (
          <div className="mt-8 mx-auto max-w-[1400px]">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
              <Image
                src={urlFor(post.mainImage).width(1600).height(900).quality(85).url()}
                alt={post.imageAlt || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl mt-10">
          <ArticleContent post={post} />
        </div>

        <div className="mx-auto max-w-5xl mt-16">
          <RelatedArticles posts={related} />
        </div>
      </article>
    </SitePage>
  )
}
