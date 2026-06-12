import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Actualites: CollectionConfig = {
  slug: 'actualites',
  access: { read: () => true },
  admin: {
    useAsTitle: 'titre',
    group: 'Contenu',
    defaultColumns: ['titre', 'createdAt', 'publie'],
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
      label: 'Titre',
    },
    {
      name: 'extrait',
      type: 'textarea',
      label: 'Extrait / Résumé',
    },
    {
      name: 'contenu',
      type: 'richText',
      editor: lexicalEditor({}),
      label: 'Contenu complet',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image principale',
    },
    {
      name: 'categorie',
      type: 'select',
      options: [
        { label: '📰 Annonce', value: 'annonce' },
        { label: '⚔️ Match', value: 'match' },
        { label: '🏆 Résultat', value: 'resultat' },
        { label: '🎭 Audition', value: 'audition' },
        { label: '🎉 Événement', value: 'evenement' },
      ],
      defaultValue: 'annonce',
      label: 'Catégorie',
    },
    {
      name: 'publie',
      type: 'checkbox',
      defaultValue: false,
      label: 'Publié',
    },
    {
      name: 'date_publication',
      type: 'date',
      label: 'Date de publication',
    },
    {
      name: 'equipe_liee',
      type: 'relationship',
      relationTo: 'equipes',
      label: 'Équipe liée',
    },
  ],
}
