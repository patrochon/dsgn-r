import type { CollectionConfig } from 'payload'

export const Equipes: CollectionConfig = {
  slug: 'equipes',
  access: { read: () => true },
  admin: {
    useAsTitle: 'nom',
    group: 'Ligue',
    defaultColumns: ['nom', 'couleur'],
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
      label: 'Nom de l\'équipe',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Identifiant URL (ex: blanches, blondes, stouts, rousses)',
      },
    },
    {
      name: 'couleur',
      type: 'text',
      label: 'Couleur principale (code hex)',
      admin: {
        description: 'Ex: #e8e8e8',
      },
    },
    {
      name: 'couleur_secondaire',
      type: 'text',
      label: 'Couleur secondaire (code hex)',
    },
    {
      name: 'devise',
      type: 'text',
      label: 'Devise / Slogan de l\'équipe',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description de l\'équipe',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo de l\'équipe',
    },
    {
      name: 'photo_equipe',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo de groupe',
    },
    {
      name: 'fondee_en',
      type: 'number',
      label: 'Année de fondation',
    },
  ],
}
