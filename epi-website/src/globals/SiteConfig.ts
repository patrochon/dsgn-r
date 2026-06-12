import type { GlobalConfig } from 'payload'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  label: 'Configuration du site',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'saison_courante',
      type: 'text',
      label: 'Saison courante',
      defaultValue: 'Automne 2025',
    },
    {
      name: 'annonce',
      type: 'text',
      label: 'Bannière d\'annonce (laissez vide pour cacher)',
      admin: {
        description: 'Texte affiché en bandeau sur toutes les pages',
      },
    },
    {
      name: 'auditions_actives',
      type: 'checkbox',
      label: 'Formulaire d\'auditions ouvert',
      defaultValue: false,
    },
    {
      name: 'message_auditions',
      type: 'textarea',
      label: 'Message de bienvenue pour les auditions',
      defaultValue: 'Les auditions pour la prochaine saison sont maintenant ouvertes! Rejoignez l\'Équipage de Piraterie Improvisé!',
    },
    {
      name: 'facebook_url',
      type: 'text',
      label: 'URL de la page Facebook',
      defaultValue: 'https://www.facebook.com/lepiyarr',
    },
    {
      name: 'hero_accueil',
      type: 'upload',
      relationTo: 'media',
      label: 'Image héro - Accueil',
    },
    {
      name: 'hero_galerie',
      type: 'upload',
      relationTo: 'media',
      label: 'Image héro - Galerie',
    },
    {
      name: 'hero_equipes',
      type: 'upload',
      relationTo: 'media',
      label: 'Image héro - Équipes',
    },
    {
      name: 'hero_horaire',
      type: 'upload',
      relationTo: 'media',
      label: 'Image héro - Horaire',
    },
    {
      name: 'prochain_match_titre',
      type: 'text',
      label: 'Titre personnalisé pour le prochain match',
    },
    {
      name: 'contact_email',
      type: 'email',
      label: 'Courriel de contact',
    },
  ],
}
