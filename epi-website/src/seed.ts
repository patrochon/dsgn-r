/*
  Seed script: npx tsx src/seed.ts
  Crée les 4 équipes et les statistiques initiales.
*/
import { getPayload } from 'payload'
import config from './payload.config'

const TEAMS = [
  {
    nom: 'Les Blanches',
    slug: 'blanches',
    couleur: '#e8e8e8',
    couleur_secondaire: '#f5f5f5',
    devise: 'La pureté en action',
    description: 'Élégantes et précises, Les Blanches jouent avec une clarté cristalline. Ne vous laissez pas tromper par leur apparence sage — leur impro est explosive!',
  },
  {
    nom: 'Les Blondes',
    slug: 'blondes',
    couleur: '#f4c430',
    couleur_secondaire: '#d4a017',
    devise: 'Brillantes sous tous les angles',
    description: 'Rayonnantes et créatives, Les Blondes illuminent la scène de leurs idées dorées. L\'or du théâtre d\'improvisation!',
  },
  {
    nom: 'Les Stouts',
    slug: 'stouts',
    couleur: '#c8804a',
    couleur_secondaire: '#6b3a1f',
    devise: 'Robustes comme le vieux rhum',
    description: 'Solides, puissants, imprévisibles. Les Stouts apportent une profondeur et une intensité uniques à chaque scène.',
  },
  {
    nom: 'Les Rousses',
    slug: 'rousses',
    couleur: '#e74c3c',
    couleur_secondaire: '#c0392b',
    devise: 'Le feu dans les veines',
    description: 'Ardentes et passionnées, Les Rousses embrasent la scène à chaque apparition. Leur énergie est contagieuse!',
  },
]

async function seed() {
  const payload = await getPayload({ config })
  console.log('🏴‍☠️ Début du seeding...')

  // Check if teams already exist
  const existing = await payload.find({ collection: 'equipes', limit: 1 })
  if (existing.docs.length > 0) {
    console.log('✅ Les équipes existent déjà. Seeding ignoré.')
    process.exit(0)
  }

  // Create teams
  const createdTeams: any[] = []
  for (const team of TEAMS) {
    const created = await payload.create({ collection: 'equipes', data: team })
    createdTeams.push(created)
    console.log(`✅ Équipe créée: ${team.nom}`)
  }

  // Create stats for current season
  const saison = 'Automne 2025'
  for (const team of createdTeams) {
    await payload.create({
      collection: 'statistiques',
      data: {
        equipe: team.id,
        saison,
        victoires: 0,
        defaites: 0,
        nulles: 0,
        points: 0,
        categories_gagnees: 0,
        penalites: 0,
      },
    })
    console.log(`✅ Stats créées: ${team.nom} — ${saison}`)
  }

  // Update site config
  await payload.updateGlobal({
    slug: 'site-config',
    data: {
      saison_courante: saison,
      facebook_url: 'https://www.facebook.com/lepiyarr',
      auditions_actives: false,
    },
  })
  console.log('✅ Configuration du site mise à jour')

  console.log('\n🎉 Seeding terminé! Visitez /admin pour créer votre compte administrateur.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Erreur de seeding:', err)
  process.exit(1)
})
