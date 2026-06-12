import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Médias',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Légende',
    },
  ],
}
