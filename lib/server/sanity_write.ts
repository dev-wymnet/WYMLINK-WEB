import "server-only";
import { createClient, type SanityClient } from "@sanity/client";
import { SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from "@/lib/sanity/project";

// Writes to the blog's Sanity dataset for the admin console. The token (an Editor token
// from sanity.io/manage → API → Tokens) stays on the server: browsers never see it.

let client: SanityClient | null = null;

export const blogWritingConfigured = () => Boolean(process.env.SANITY_API_WRITE_TOKEN);

export function sanityWriter(): SanityClient {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error("SANITY_API_WRITE_TOKEN is not set");
  client ??= createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: process.env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
    perspective: "raw",
    // Only for local tests against a stand-in API.
    ...(process.env.SANITY_API_HOST ? { apiHost: process.env.SANITY_API_HOST, useProjectHostname: false } : {}),
  });
  return client;
}
