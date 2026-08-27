import type { CollectionConfig } from 'payload'

export const Matchs: CollectionConfig = {
  slug: 'matchs',
  access: { read: () => true },
  admin: {
    useAsTitle: 'titre',
    group: 'Ligue',
    defaultColumns: ['titre', 'date', 'saison', 'statut'],
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      label: 'Titre du match',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lieu',
      type: 'text',
      label: 'Lieu',
      defaultValue: 'Théâtre ÉPI',
    },
    {
      name: 'saison',
      type: 'text',
      required: true,
      label: 'Saison (ex: Automne 2024)',
    },
    {
      name: 'numero_match',
      type: 'number',
      label: 'Numéro du match dans la saison',
    },
    {
      name: 'equipes_participantes',
      type: 'relationship',
      relationTo: 'equipes',
      hasMany: true,
      label: 'Équipes participantes',
    },
    {
      name: 'statut',
      type: 'select',
      options: [
        { label: '⏳ À venir', value: 'a_venir' },
        { label: '✅ Terminé', value: 'termine' },
        { label: '❌ Annulé', value: 'annule' },
      ],
      defaultValue: 'a_venir',
      label: 'Statut',
    },
    {
      name: 'gagnant',
      type: 'relationship',
      relationTo: 'equipes',
      label: 'Équipe gagnante',
      admin: {
        condition: (data) => data.statut === 'termine',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description / Résumé',
    },
    {
      name: 'scores',
      type: 'array',
      label: 'Scores par équipe',
      fields: [
        {
          name: 'equipe',
          type: 'relationship',
          relationTo: 'equipes',
          label: 'Équipe',
        },
        {
          name: 'points',
          type: 'number',
          label: 'Points',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'image_couverture',
      type: 'upload',
      relationTo: 'media',
      label: 'Image de couverture',
    },
  ],
}
