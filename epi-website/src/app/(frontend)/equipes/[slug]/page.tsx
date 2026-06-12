import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const DEFAULT_COLORS: Record<string, string> = {
  blanches: '#e8e8e8',
  blondes:  '#f4c430',
  stouts:   '#c8804a',
  rousses:  '#e74c3c',
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Équipe — ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
  }
}

export default async function EquipeDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayloadClient()

  const equipeData = await payload.find({
    collection: 'equipes',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  if (!equipeData.docs.length) notFound()

  const equipe = equipeData.docs[0] as any
  const color = equipe.couleur || DEFAULT_COLORS[slug] || '#d4a853'

  const [joueursData, statsData, photosData, matchsData] = await Promise.all([
    payload.find({
      collection: 'joueurs',
      where: {
        equipe: { equals: equipe.id },
        actif: { equals: true },
      },
      depth: 1,
      limit: 30,
    }),
    payload.find({
      collection: 'statistiques',
      where: { equipe: { equals: equipe.id } },
      sort: '-saison',
      depth: 1,
      limit: 10,
    }),
    payload.find({
      collection: 'photos',
      where: { equipes: { contains: equipe.id } },
      depth: 2,
      limit: 12,
      sort: '-createdAt',
    }),
    payload.find({
      collection: 'matchs',
      where: { equipes_participantes: { contains: equipe.id } },
      depth: 1,
      sort: '-date',
      limit: 10,
    }),
  ])

  const joueurs = joueursData.docs
  const stats = statsData.docs
  const photos = photosData.docs
  const matchs = matchsData.docs

  const capitaine = joueurs.find((j: any) => j.role === 'capitaine')
  const assistant = joueurs.find((j: any) => j.role === 'assistant')
  const membres = joueurs.filter((j: any) => j.role === 'joueur')

  return (
    <div className="min-h-screen">
      {/* Team Hero */}
      <section
        className="relative min-h-[50vh] flex items-center"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${color}15 0%, transparent 60%),
                       linear-gradient(180deg, #0a1628 0%, #050b14 100%)`,
        }}
      >
        {equipe.photo_equipe && (equipe.photo_equipe as any)?.filename && (
          <>
            <div className="absolute inset-0">
              <Image
                src={`/media/${(equipe.photo_equipe as any).filename}`}
                alt={equipe.nom}
                fill
                className="object-cover opacity-20"
              />
            </div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${color}10 0%, #050b14 100%)` }} />
          </>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 w-full">
          <Link href="/equipes" className="text-parchment-200/50 hover:text-gold-500 text-sm transition-colors mb-6 inline-block">
            ← Toutes les équipes
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Team avatar */}
            {equipe.logo && (equipe.logo as any)?.filename ? (
              <Image
                src={`/media/${(equipe.logo as any).filename}`}
                alt={equipe.nom}
                width={100}
                height={100}
                className="rounded-full border-2 object-cover"
                style={{ borderColor: color }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-pirate font-bold flex-shrink-0"
                style={{ background: `${color}20`, color, border: `2px solid ${color}60` }}
              >
                {equipe.nom?.charAt(4) || '⚓'}
              </div>
            )}

            <div>
              <div className="text-parchment-200/50 text-sm font-pirate uppercase tracking-widest mb-1">
                Équipe
              </div>
              <h1 className="font-pirate font-bold text-5xl mb-2" style={{ color }}>
                {equipe.nom}
              </h1>
              {equipe.devise && (
                <p className="italic text-parchment-200/60">&ldquo;{equipe.devise}&rdquo;</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {equipe.description && (
              <div className="pirate-card p-6">
                <h2 className="font-pirate font-bold text-xl mb-3" style={{ color }}>
                  À propos
                </h2>
                <p className="text-parchment-200/80 leading-relaxed">{equipe.description}</p>
              </div>
            )}

            {/* Roster */}
            <div className="pirate-card p-6">
              <h2 className="font-pirate font-bold text-xl mb-5" style={{ color }}>
                ⚓ L&apos;Équipage
              </h2>

              {/* Captain & Assistant */}
              {(capitaine || assistant) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[capitaine, assistant].filter(Boolean).map((j: any) => (
                    <div
                      key={j.id}
                      className="flex items-center gap-4 p-4 rounded-lg"
                      style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                    >
                      {j.photo && (j.photo as any)?.filename ? (
                        <Image
                          src={`/media/${(j.photo as any).filename}`}
                          alt={j.nom}
                          width={56}
                          height={56}
                          className="rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
                          style={{ background: `${color}30`, color }}
                        >
                          {j.nom[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-pirate font-bold text-parchment-100">{j.nom}</div>
                        <div className="text-sm font-semibold" style={{ color: `${color}99` }}>
                          {j.role === 'capitaine' ? '👑 Capitaine' : '⚔️ Assistant'}
                        </div>
                        {j.saisons && (
                          <div className="text-xs text-parchment-200/40 mt-0.5">
                            {j.saisons} saison{j.saisons > 1 ? 's' : ''}
                          </div>
                        )}
                        {j.bio && <p className="text-parchment-200/50 text-xs mt-1 line-clamp-2">{j.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other members */}
              {membres.length > 0 && (
                <>
                  <h3 className="font-pirate text-parchment-200/60 text-sm uppercase tracking-widest mb-3">
                    Membres
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {membres.map((j: any) => (
                      <div key={j.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${color}08` }}>
                        {j.photo && (j.photo as any)?.filename ? (
                          <Image
                            src={`/media/${(j.photo as any).filename}`}
                            alt={j.nom}
                            width={32}
                            height={32}
                            className="rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: `${color}20`, color }}
                          >
                            {j.nom[0]}
                          </div>
                        )}
                        <span className="text-parchment-200/80 text-sm font-medium truncate">{j.nom}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {joueurs.length === 0 && (
                <p className="text-parchment-200/40 italic">Composition à venir</p>
              )}
            </div>

            {/* Photos */}
            {photos.length > 0 && (
              <div className="pirate-card p-6">
                <h2 className="font-pirate font-bold text-xl mb-5" style={{ color }}>
                  📸 Photos
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 9).map((photo: any) => {
                    const img = photo.image
                    const src = typeof img === 'object' && img?.filename ? `/media/${img.filename}` : null
                    if (!src) return null
                    return (
                      <a key={photo.id} href={src} target="_blank" rel="noopener noreferrer" className="gallery-item">
                        <Image src={src} alt={photo.legende || ''} fill className="object-cover" />
                        <div className="overlay" />
                      </a>
                    )
                  })}
                </div>
                <Link href="/galerie" className="text-sm mt-3 inline-block" style={{ color: `${color}80` }}>
                  Voir toute la galerie →
                </Link>
              </div>
            )}
          </div>

          {/* Right column — stats */}
          <div className="space-y-6">
            {/* Stats history */}
            {stats.length > 0 && (
              <div className="pirate-card p-6">
                <h2 className="font-pirate font-bold text-xl mb-5" style={{ color }}>
                  🏆 Statistiques
                </h2>
                <div className="space-y-6">
                  {stats.map((stat: any) => (
                    <div key={stat.id}>
                      <div className="font-pirate font-semibold text-parchment-200/80 mb-3">
                        {stat.saison}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        {[
                          { label: 'Victoires', value: stat.victoires, color: '#2ecc71' },
                          { label: 'Défaites', value: stat.defaites, color: '#e74c3c' },
                          { label: 'Nuls', value: stat.nulles, color: '#95a5a6' },
                        ].map((s) => (
                          <div key={s.label} className="rounded-lg p-2" style={{ background: `${color}08` }}>
                            <div className="font-pirate font-bold text-xl" style={{ color: s.color }}>{s.value ?? 0}</div>
                            <div className="text-parchment-200/40 text-xs">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-parchment-200/50 text-sm">Points</span>
                        <span className="font-pirate font-bold" style={{ color }}>{stat.points ?? 0}</span>
                      </div>
                      {stat.rang && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-parchment-200/50 text-sm">Rang</span>
                          <span className="font-pirate font-bold text-gold-500">#{stat.rang}</span>
                        </div>
                      )}
                      {stat.meilleur_joueur && typeof stat.meilleur_joueur === 'object' && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-parchment-200/50 text-sm">MVP</span>
                          <span className="text-parchment-200/80 text-sm">⭐ {stat.meilleur_joueur.nom}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link href="/stats" className="text-sm mt-4 inline-block" style={{ color: `${color}80` }}>
                  Classement complet →
                </Link>
              </div>
            )}

            {/* Recent matches */}
            {matchs.length > 0 && (
              <div className="pirate-card p-6">
                <h2 className="font-pirate font-bold text-xl mb-4" style={{ color }}>
                  ⚔️ Matchs récents
                </h2>
                <div className="space-y-3">
                  {matchs.slice(0, 5).map((match: any) => (
                    <div key={match.id} className="flex items-center justify-between gap-2 py-2 border-b border-gold-500/10">
                      <div className="flex-1 min-w-0">
                        <div className="text-parchment-200/80 text-sm font-medium truncate">{match.titre}</div>
                        <div className="text-parchment-200/40 text-xs">
                          {new Date(match.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      {match.statut === 'termine' && match.gagnant && typeof match.gagnant === 'object' && (
                        <div
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: match.gagnant.id === equipe.id ? '#2ecc7120' : '#e74c3c20',
                            color: match.gagnant.id === equipe.id ? '#2ecc71' : '#e74c3c',
                            border: `1px solid ${match.gagnant.id === equipe.id ? '#2ecc7140' : '#e74c3c40'}`,
                          }}
                        >
                          {match.gagnant.id === equipe.id ? '✓ Victoire' : '✗ Défaite'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
