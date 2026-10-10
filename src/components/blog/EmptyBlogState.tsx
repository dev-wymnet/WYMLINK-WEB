import Link from 'next/link'

export default function EmptyBlogState() {
  return (
    <div className="text-center py-16">
      <h3 className="text-xl font-semibold">No articles found</h3>
      <p className="mt-2 text-muted-foreground">We couldn&apos;t find any articles matching your current filters.</p>
      <div className="mt-4">
        <Link href="/blog" className="btn">Clear filters</Link>
      </div>
    </div>
  )
}
