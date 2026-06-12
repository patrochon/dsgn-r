import type { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  access: { read: () => true },
  admin: {
    useAsTitle: 'legende',
    group: 'Médias',
    defaultColumns: ['legende', 'match', 'mise_en_avant'],
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Photo',
    },
    {
      name: 'legende',
      type: 'text',
      label: 'Légende',
    },
    {
      name: 'match',
      type: 'relationship',
      relationTo: 'matchs',
      label: 'Match associé',
    },
    {
      name: 'equipes',
      type: 'relationship',
      relationTo: 'equipes',
      hasMany: true,
      label: 'Équipes sur la photo',
    },
    {
      name: 'joueurs',
      type: 'relationship',
      relationTo: 'joueurs',
      hasMany: true,
      label: 'Joueurs identifiés',
    },
    {
      name: 'photographe',
      type: 'text',
      label: 'Photographe',
    },
    {
      name: 'mise_en_avant',
      type: 'checkbox',
      label: 'Photo mise en avant (accueil)',
      defaultValue: false,
    },
    {
      name: 'ordre',
      type: 'number',
      label: 'Ordre d\'affichage',
      defaultValue: 0,
    },
  ],
}
