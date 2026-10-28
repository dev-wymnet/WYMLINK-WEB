import Link from 'next/link'
import { Post } from '@/lib/sanity/types'

function estimateReadingMinutes(post: Post): number {
  const blocks = Array.isArray(post.body) ? post.body : []
  const text = blocks
    .filter((b) => b?._type === 'block')
    .map((b) => (Array.isArray(b.children) ? b.children.map((c) => ('text' in c && typeof c.text === 'string' ? c.text : '')).join(' ') : ''))
    .join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return minutes
}

export default function ArticleHeader({ post }: { post: Post }) {
  const minutes = estimateReadingMinutes(post)
  return (
    <header className="mx-auto max-w-3xl text-left">
      <div className="mb-2">
        <Link href="/blog" className="text-sm text-muted-foreground hover:underline">← Back to insights</Link>
      </div>
      <p className="text-xs font-semibold tracking-widest text-primary-600 uppercase">{post.category?.title}</p>
      <h1 className="mt-3 font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl">
        {post.title}
      </h1>
      {post.excerpt && (
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{post.excerpt}</p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{post.author?.name}</span>
        <span>·</span>
        <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString()}</time>
        {minutes ? (
          <>
            <span>·</span>
            <span>{minutes} min read</span>
          </>
        ) : null}
      </div>
    </header>
  )
}
