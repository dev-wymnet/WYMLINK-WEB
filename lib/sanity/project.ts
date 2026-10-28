// The blog's Sanity project. These are public values (they appear in every image URL), so
// they default here: a deploy without the env vars still builds and shows the blog.
export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_iD || "vstxv62p";
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
