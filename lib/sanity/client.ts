import { createClient } from '@sanity/client'
import { SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from './project'

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
  perspective: 'published',
})
