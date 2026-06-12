import type { CollectionConfig } from 'payload'

export const Joueurs: CollectionConfig = {
  slug: 'joueurs',
  access: { read: () => true },
  admin: {
    useAsTitle: 'nom',
    group: 'Ligue',
    defaultColumns: ['nom', 'equipe', 'role', 'actif'],
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
      label: 'Nom du joueur',
    },
    {
      name: 'equipe',
      type: 'relationship',
      relationTo: 'equipes',
      required: true,
      label: 'Équipe',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Joueur', value: 'joueur' },
        { label: 'Capitaine', value: 'capitaine' },
        { label: 'Assistant capitaine', value: 'assistant' },
      ],
      defaultValue: 'joueur',
      label: 'Rôle',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Biographie courte',
    },
    {
      name: 'numero',
      type: 'number',
      label: 'Numéro de joueur',
    },
    {
      name: 'saisons',
      type: 'number',
      label: 'Nombre de saisons',
      defaultValue: 1,
    },
    {
      name: 'actif',
      type: 'checkbox',
      defaultValue: true,
      label: 'Joueur actif',
    },
  ],
}
