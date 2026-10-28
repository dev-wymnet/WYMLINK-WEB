import type { PortableTextBlock } from '@portabletext/react'

export type SanityRef = {
  _type: 'reference'
  _ref: string
}

export type ImageAsset = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  alt?: string | null
}

export type Author = {
  _id: string
  name: string
  slug?: { current: string }
  image?: ImageAsset | null
  role?: string | null
  bio?: string | null
  socialLinks?: { linkedin?: string; twitter?: string; website?: string } | null
}

export type Category = {
  _id: string
  title: string
  slug?: { current: string }
  description?: string | null
  color?: string | null
  featured?: boolean | null
}

export type Post = {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string | null
  mainImage?: ImageAsset | null
  imageAlt?: string | null
  author: Author
  category: Category
  publishedAt: string
  updatedAt?: string | null
  featured?: boolean | null
  tags?: string[]
  body: PortableTextBlock[]
  seoTitle?: string | null
  seoDescription?: string | null
  seoImage?: ImageAsset | null
}

export type BlogFilters = {
  category?: string
  author?: string
  search?: string
  page?: number
}
