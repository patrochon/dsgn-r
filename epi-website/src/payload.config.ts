import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Equipes } from './collections/Equipes'
import { Joueurs } from './collections/Joueurs'
import { Matchs } from './collections/Matchs'
import { Photos } from './collections/Photos'
import { Horaire } from './collections/Horaire'
import { Statistiques } from './collections/Statistiques'
import { Auditions } from './collections/Auditions'
import { Commentaires } from './collections/Commentaires'
import { Actualites } from './collections/Actualites'
import { SiteConfig } from './globals/SiteConfig'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— ÉPI Admin',
      description: 'Panneau d\'administration du site de la ligue ÉPI',
    },
  },
  collections: [
    Users,
    Media,
    Equipes,
    Joueurs,
    Matchs,
    Photos,
    Horaire,
    Statistiques,
    Auditions,
    Commentaires,
    Actualites,
  ],
  globals: [SiteConfig],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'epi-secret-key-change-in-prod',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || `file:${path.resolve(dirname, '../epi-database.db')}`,
    },
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
