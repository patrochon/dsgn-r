import type { CollectionConfig } from 'payload'

export const Horaire: CollectionConfig = {
  slug: 'horaire',
  access: { read: () => true },
  admin: {
    useAsTitle: 'titre',
    group: 'Ligue',
    defaultColumns: ['titre', 'date', 'type', 'lieu'],
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      label: 'Titre de l\'événement',
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
      name: 'heure_fin',
      type: 'date',
      label: 'Heure de fin',
      admin: {
        date: {
          pickerAppearance: 'timeOnly',
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
      name: 'adresse',
      type: 'text',
      label: 'Adresse complète',
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: '⚔️ Match', value: 'match' },
        { label: '🎭 Audition', value: 'audition' },
        { label: '⚓ Entraînement', value: 'entrainement' },
        { label: '🏆 Tournoi', value: 'tournoi' },
        { label: '🎉 Événement spécial', value: 'special' },
        { label: '🍻 5 à 7', value: 'social' },
      ],
      defaultValue: 'match',
      label: 'Type d\'événement',
    },
    {
      name: 'saison',
      type: 'text',
      label: 'Saison',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'match_lie',
      type: 'relationship',
      relationTo: 'matchs',
      label: 'Match lié',
    },
    {
      name: 'lien_billets',
      type: 'text',
      label: 'Lien pour les billets',
    },
    {
      name: 'prix_entree',
      type: 'text',
      label: 'Prix d\'entrée',
      defaultValue: 'Gratuit',
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible sur le site',
    },
  ],
}
