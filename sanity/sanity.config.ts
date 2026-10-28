import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { codeInput } from '@sanity/code-input'
import { schemaTypes } from './schemaTypes'
import { appName } from '@/data/constants/app_name'
import { SANITY_DATASET, SANITY_PROJECT_ID } from '@/lib/sanity/project'

export default defineConfig({
  name: 'default',
  title: `${appName} Studio`,
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  basePath: '/studio',
  plugins: [structureTool(), visionTool(), codeInput()],
  schema: { types: schemaTypes },
})
