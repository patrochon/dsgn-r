import type { CollectionConfig } from 'payload'

export const Statistiques: CollectionConfig = {
  slug: 'statistiques',
  access: { read: () => true },
  admin: {
    useAsTitle: 'saison',
    group: 'Ligue',
    defaultColumns: ['equipe', 'saison', 'victoires', 'defaites', 'points'],
  },
  fields: [
    {
      name: 'equipe',
      type: 'relationship',
      relationTo: 'equipes',
      required: true,
      label: 'Équipe',
    },
    {
      name: 'saison',
      type: 'text',
      required: true,
      label: 'Saison (ex: Automne 2024)',
    },
    {
      name: 'victoires',
      type: 'number',
      defaultValue: 0,
      label: 'Victoires',
      min: 0,
    },
    {
      name: 'defaites',
      type: 'number',
      defaultValue: 0,
      label: 'Défaites',
      min: 0,
    },
    {
      name: 'nulles',
      type: 'number',
      defaultValue: 0,
      label: 'Matchs nuls',
      min: 0,
    },
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      label: 'Points au classement',
      min: 0,
    },
    {
      name: 'categories_gagnees',
      type: 'number',
      defaultValue: 0,
      label: 'Catégories gagnées',
      min: 0,
    },
    {
      name: 'penalites',
      type: 'number',
      defaultValue: 0,
      label: 'Pénalités reçues',
      min: 0,
    },
    {
      name: 'rang',
      type: 'number',
      label: 'Rang au classement',
      min: 1,
    },
    {
      name: 'meilleur_joueur',
      type: 'relationship',
      relationTo: 'joueurs',
      label: 'MVP de la saison',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes / commentaires',
    },
  ],
}
