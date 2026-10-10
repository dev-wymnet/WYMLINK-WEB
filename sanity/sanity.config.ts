import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { codeInput } from '@sanity/code-input'
import { schemaTypes } from './schemaTypes'
import { appName } from '@/data/constants/app_name'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_iD
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: `${appName} Studio`,
  projectId: projectId!,
  dataset,
  basePath: '/studio',
  plugins: [structureTool(), visionTool(), codeInput()],
  schema: { types: schemaTypes },
})
