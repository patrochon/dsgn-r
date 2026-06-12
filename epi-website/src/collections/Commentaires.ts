import type { CollectionConfig } from 'payload'

export const Commentaires: CollectionConfig = {
  slug: 'commentaires',
  admin: {
    useAsTitle: 'nom',
    group: 'Inscriptions',
    defaultColumns: ['nom', 'message', 'approuve', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
      label: 'Nom',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Courriel (non affiché publiquement)',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
    },
    {
      name: 'approuve',
      type: 'checkbox',
      defaultValue: false,
      label: 'Approuvé pour affichage',
    },
    {
      name: 'page',
      type: 'select',
      options: [
        { label: '🏠 Général', value: 'general' },
        { label: '📸 Galerie', value: 'galerie' },
        { label: '⚓ Équipes', value: 'equipes' },
        { label: '📅 Horaire', value: 'horaire' },
      ],
      defaultValue: 'general',
      label: 'Section',
    },
    {
      name: 'reponse_admin',
      type: 'textarea',
      label: 'Réponse de l\'équipe ÉPI',
    },
  ],
}
