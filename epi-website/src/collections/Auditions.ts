import type { CollectionConfig } from 'payload'

export const Auditions: CollectionConfig = {
  slug: 'auditions',
  admin: {
    useAsTitle: 'nom',
    group: 'Inscriptions',
    defaultColumns: ['nom', 'email', 'createdAt', 'statut'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      required: true,
      label: 'Nom complet',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Courriel',
    },
    {
      name: 'telephone',
      type: 'text',
      label: 'Téléphone',
    },
    {
      name: 'age',
      type: 'number',
      label: 'Âge',
      min: 14,
      max: 99,
    },
    {
      name: 'ville',
      type: 'text',
      label: 'Ville',
    },
    {
      name: 'experience_impro',
      type: 'select',
      label: 'Expérience en improvisation',
      options: [
        { label: 'Aucune', value: 'aucune' },
        { label: 'Débutant (moins de 1 an)', value: 'debutant' },
        { label: 'Intermédiaire (1-3 ans)', value: 'intermediaire' },
        { label: 'Avancé (3-5 ans)', value: 'avance' },
        { label: 'Expert (5+ ans)', value: 'expert' },
      ],
    },
    {
      name: 'description_experience',
      type: 'textarea',
      label: 'Décrivez votre expérience en improvisation et théâtre',
    },
    {
      name: 'motivation',
      type: 'textarea',
      label: 'Pourquoi voulez-vous rejoindre l\'ÉPI?',
    },
    {
      name: 'disponibilites',
      type: 'textarea',
      label: 'Vos disponibilités',
      admin: {
        description: 'Les matchs ont généralement lieu les vendredis soirs',
      },
    },
    {
      name: 'comment_connu',
      type: 'text',
      label: 'Comment avez-vous entendu parler de nous?',
    },
    {
      name: 'saison',
      type: 'text',
      label: 'Saison demandée',
      admin: {
        description: 'Ex: Automne 2025',
      },
    },
    {
      name: 'statut',
      type: 'select',
      options: [
        { label: '📬 En attente', value: 'en_attente' },
        { label: '📞 Contacté', value: 'contacte' },
        { label: '🎭 Audition planifiée', value: 'planifie' },
        { label: '✅ Accepté', value: 'accepte' },
        { label: '❌ Refusé', value: 'refuse' },
      ],
      defaultValue: 'en_attente',
      label: 'Statut de la demande',
    },
    {
      name: 'notes_internes',
      type: 'textarea',
      label: 'Notes internes (non visible par le candidat)',
      admin: {
        description: 'Notes réservées aux administrateurs',
      },
    },
  ],
}
