import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'

const TEAM_COLORS: Record<string, string> = {
  blanches: '#e8e8e8',
  blondes:  '#f4c430',
  stouts:   '#c8804a',
  rousses:  '#e74c3c',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayloadClient()

  const configData = await payload.findGlobal({ slug: 'site-config', depth: 1 })
  const saisonCourante = (configData as any)?.saison_courante || 'Automne 2025'

  const [matchsData, photosData, actualitesData, statsData] = await Promise.all([
    payload.find({
      collection: 'matchs',
      where: { statut: { equals: 'a_venir' } },
      sort: 'date',
      limit: 3,
    }),
    payload.find({
      collection: 'photos',
      where: { mise_en_avant: { equals: true } },
      limit: 6,
      depth: 1,
    }),
    payload.find({
      collection: 'actualites',
      where: { publie: { equals: true } },
      sort: '-date_publication',
      limit: 3,
      depth: 1,
    }),
    payload.find({
      collection: 'statistiques',
      where: { saison: { equals: saisonCourante } },
      depth: 2,
      limit: 4,
    }),
  ])

  const prochainMatchs = matchsData.docs
  const photosEnAvant = photosData.docs
  const actualites = actualitesData.docs
  const siteConfig = configData as any
  const stats = statsData.docs.sort((a: any, b: any) => (b.points || 0) - (a.points || 0))

  return (
    <>
      {/* Announcement Banner */}
      {siteConfig?.annonce && (
        <div className="bg-gold-600 text-navy-900 text-center py-2 px-4 text-sm font-semibold font-pirate">
          ⚓ {siteConfig.annonce} ⚓
        </div>
      )}

      {/* Hero */}
      <HeroSection
        title="Équipage de Piraterie Improvisé"
        subtitle="Quatre équipes. Mille scènes. Une seule ligue. Embarquez pour l'aventure!"
        height="full"
        imageUrl={siteConfig?.hero_accueil ? `/media/${(siteConfig.hero_accueil as any)?.filename}` : undefined}
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/galerie" className="btn-gold">
            📸 Voir la galerie
          </Link>
          <Link href="/horaire" className="btn-outline">
            📅 Prochain match
          </Link>
          {siteConfig?.auditions_actives && (
            <Link href="/auditions" className="btn-gold">
              🎭 Auditions ouvertes!
            </Link>
          )}
        </div>
      </HeroSection>

      {/* Prochains matchs */}
      {prochainMatchs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="section-title">⚔ Prochains Matchs</h2>
          <div className="section-divider">
            <span className="text-gold-500/50 text-lg">⚓</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prochainMatchs.map((match: any) => (
              <div key={match.id} className="pirate-card p-6">
                <div className="text-gold-500/60 text-xs font-pirate uppercase tracking-widest mb-2">
                  {match.saison}
                </div>
                <h3 className="font-pirate font-bold text-parchment-100 text-lg mb-3">
                  {match.titre}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-parchment-200/70">
                    <span>📅</span>
                    <span>
                      {new Date(match.date).toLocaleDateString('fr-CA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {match.lieu && (
                    <div className="flex items-center gap-2 text-parchment-200/70">
                      <span>📍</span>
                      <span>{match.lieu}</span>
                    </div>
                  )}
                  {match.equipes_participantes?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {match.equipes_participantes.map((equipe: any) => {
                        const slug = typeof equipe === 'object' ? equipe.slug : equipe
                        const nom = typeof equipe === 'object' ? equipe.nom : equipe
                        return (
                          <span
                            key={slug}
                            className="team-badge"
                            style={{
                              color: TEAM_COLORS[slug] || '#d4a853',
                              borderColor: TEAM_COLORS[slug] || '#d4a853',
                              background: `${TEAM_COLORS[slug] || '#d4a853'}20`,
                            }}
                          >
                            ⚔ {nom}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/horaire" className="btn-outline">
              Voir tout l&apos;horaire →
            </Link>
          </div>
        </section>
      )}

      {/* Classement rapide */}
      {stats.length > 0 && (
        <section className="py-16 bg-navy-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="section-title">🏆 Classement — {siteConfig?.saison_courante}</h2>
            <div className="section-divider">
              <span className="text-gold-500/50 text-lg">⚓</span>
            </div>
            <div className="max-w-2xl mx-auto">
              {stats.map((stat: any, index: number) => {
                const equipe = stat.equipe
                const nom = typeof equipe === 'object' ? equipe.nom : 'Équipe'
                const slug = typeof equipe === 'object' ? equipe.slug : ''
                return (
                  <div
                    key={stat.id}
                    className="flex items-center gap-4 mb-3 pirate-card p-4"
                    style={{
                      borderLeftColor: TEAM_COLORS[slug] || '#d4a853',
                      borderLeftWidth: 3,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-navy-900 font-pirate font-bold flex-shrink-0"
                      style={{ background: index === 0 ? '#d4a853' : index === 1 ? '#c0c0c0' : index === 2 ? '#c8804a' : '#333' }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-pirate font-bold" style={{ color: TEAM_COLORS[slug] || '#d4a853' }}>
                        {nom}
                      </div>
                      <div className="text-xs text-parchment-200/50">
                        {stat.victoires}V · {stat.defaites}D · {stat.nulles}N
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-500 font-bold font-pirate text-lg">{stat.points}</div>
                      <div className="text-xs text-parchment-200/50">pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-6">
              <Link href="/stats" className="btn-outline">
                Statistiques complètes →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Les 4 équipes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="section-title">⚓ Les Équipes</h2>
        <div className="section-divider">
          <span className="text-gold-500/50 text-lg">⚓</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { slug: 'blanches', name: 'Les Blanches', color: '#e8e8e8', desc: 'La pureté de l\'improvisation' },
            { slug: 'blondes',  name: 'Les Blondes',  color: '#f4c430', desc: 'Brillantes sous les projecteurs' },
            { slug: 'stouts',   name: 'Les Stouts',   color: '#c8804a', desc: 'Robustes comme un vieux rhum' },
            { slug: 'rousses',  name: 'Les Rousses',  color: '#e74c3c', desc: 'Ardentes et imprévisibles' },
          ].map((team) => (
            <Link
              key={team.slug}
              href={`/equipes/${team.slug}`}
              className="pirate-card p-6 text-center group block"
              style={{ '--team-color': team.color } as React.CSSProperties}
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-pirate font-bold text-navy-900 group-hover:scale-110 transition-transform"
                style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}99)` }}
              >
                {team.name[4]}
              </div>
              <h3
                className="font-pirate font-bold text-lg mb-2"
                style={{ color: team.color }}
              >
                {team.name}
              </h3>
              <p className="text-parchment-200/60 text-sm">{team.desc}</p>
              <div
                className="mt-4 text-xs font-pirate uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: team.color }}
              >
                Voir l&apos;équipe →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Galerie mise en avant */}
      {photosEnAvant.length > 0 && (
        <section className="py-16 bg-navy-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="section-title">📸 Moments Mémorables</h2>
            <div className="section-divider">
              <span className="text-gold-500/50 text-lg">⚓</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photosEnAvant.map((photo: any) => {
                const img = photo.image
                const src = typeof img === 'object' && img?.filename ? `/media/${img.filename}` : null
                if (!src) return null
                return (
                  <div key={photo.id} className="gallery-item">
                    <Image
                      src={src}
                      alt={photo.legende || 'Photo ÉPI'}
                      fill
                      className="object-cover transition-transform duration-400 hover:scale-105"
                    />
                    <div className="overlay">
                      {photo.legende && (
                        <p className="text-parchment-100 text-sm font-medium">{photo.legende}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/galerie" className="btn-gold">
                📸 Voir toute la galerie →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Actualités */}
      {actualites.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="section-title">📰 Actualités</h2>
          <div className="section-divider">
            <span className="text-gold-500/50 text-lg">⚓</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actualites.map((actu: any) => (
              <div key={actu.id} className="pirate-card overflow-hidden">
                {actu.image && (actu.image as any)?.filename && (
                  <div className="aspect-video relative">
                    <Image
                      src={`/media/${(actu.image as any).filename}`}
                      alt={actu.titre}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs text-gold-500/70 font-pirate uppercase tracking-wider mb-2">
                    {actu.categorie} · {actu.date_publication
                      ? new Date(actu.date_publication).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })
                      : ''}
                  </div>
                  <h3 className="font-pirate font-bold text-parchment-100 mb-2">{actu.titre}</h3>
                  {actu.extrait && (
                    <p className="text-parchment-200/60 text-sm leading-relaxed">{actu.extrait}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Facebook CTA */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="skull-separator">⚓</div>
          <h2 className="font-pirate text-3xl font-bold gold-text mb-4">
            Rejoignez l&apos;équipage!
          </h2>
          <p className="text-parchment-200/70 mb-8">
            Suivez nos aventures sur Facebook pour rester informé des prochains matchs,
            des résultats et des coulisses de l&apos;ÉPI.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://www.facebook.com/lepiyarr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              📘 Page Facebook de l&apos;ÉPI
            </a>
            <Link href="/auditions" className="btn-outline">
              🎭 Faire une audition
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
