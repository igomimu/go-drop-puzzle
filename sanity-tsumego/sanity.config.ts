import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Sanity+Vibecording',

  projectId: 'btwmxz8u',
  dataset: 'tsumego',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
