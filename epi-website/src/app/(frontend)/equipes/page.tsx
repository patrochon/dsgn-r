import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'

export const metadata: Metadata = {
  title: 'Les Équipes',
  description: 'Découvrez les quatre équipes de la ligue ÉPI',
}

export const dynamic = 'force-dynamic'

const DEFAULT_COLORS: Record<string, { main: string; bg: string }> = {
  blanches: { main: '#e8e8e8', bg: 'rgba(232,232,232,0.08)' },
  blondes:  { main: '#f4c430', bg: 'rgba(244,196,48,0.08)' },
  stouts:   { main: '#c8804a', bg: 'rgba(200,128,74,0.08)' },
  rousses:  { main: '#e74c3c', bg: 'rgba(231,76,60,0.08)' },
}

export default async function EquipesPage() {
  const payload = await getPayloadClient()

  const [equipesData, joueursData, statsData, configData] = await Promise.all([
    payload.find({ collection: 'equipes', depth: 1, limit: 10 }),
    payload.find({ collection: 'joueurs', where: { actif: { equals: true } }, depth: 1, limit: 100 }),
    payload.find({ collection: 'statistiques', depth: 2, limit: 20 }),
    payload.findGlobal({ slug: 'site-config' }),
  ])

  const equipes = equipesData.docs
  const joueurs = joueursData.docs
  const saison = (configData as any)?.saison_courante || ''

  // Stats for current season
  const statsMap: Record<string, any> = {}
  statsData.docs.forEach((s: any) => {
    if (s.saison === saison && s.equipe && typeof s.equipe === 'object') {
      statsMap[s.equipe.id] = s
    }
  })

  // Players per team
  const joueursParEquipe: Record<string, any[]> = {}
  joueurs.forEach((j: any) => {
    const equipeId = typeof j.equipe === 'object' ? j.equipe.id : j.equipe
    if (!joueursParEquipe[equipeId]) joueursParEquipe[equipeId] = []
    joueursParEquipe[equipeId].push(j)
  })

  return (
    <>
      <HeroSection
        title="Les Équipes"
        subtitle="Quatre factions, quatre destins. Qui arborera le drapeau du champion?"
        height="small"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {equipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚓</div>
            <p className="font-pirate text-2xl text-gold-500">Les équipes arrivent bientôt!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {equipes.map((equipe: any) => {
              const colors = DEFAULT_COLORS[equipe.slug] || { main: '#d4a853', bg: 'rgba(212,168,83,0.08)' }
              const color = equipe.couleur || colors.main
              const teamJoueurs = joueursParEquipe[equipe.id] || []
              const capitaine = teamJoueurs.find((j: any) => j.role === 'capitaine')
              const assistant = teamJoueurs.find((j: any) => j.role === 'assistant')
              const membres = teamJoueurs.filter((j: any) => j.role === 'joueur')
              const stat = statsMap[equipe.id]

              return (
                <div
                  key={equipe.id}
                  className="pirate-card overflow-hidden"
                  style={{ borderColor: `${color}40` }}
                >
                  {/* Team header */}
                  <div
                    className="p-8 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      {/* Team photo or placeholder */}
                      {equipe.photo_equipe && (equipe.photo_equipe as any)?.filename ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: color }}>
                          <Image
                            src={`/media/${(equipe.photo_equipe as any).filename}`}
                            alt={equipe.nom}
                            width={96}
                            height={96}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-pirate font-bold"
                          style={{ background: `${color}25`, color, border: `2px solid ${color}60` }}
                        >
                          {equipe.nom?.charAt(4) || '⚓'}
                        </div>
                      )}

                      <div className="flex-1">
                        <h2 className="font-pirate font-bold text-3xl mb-1" style={{ color }}>
                          {equipe.nom}
                        </h2>
                        {equipe.devise && (
                          <p className="italic text-parchment-200/60 text-sm mb-2">
                            &ldquo;{equipe.devise}&rdquo;
                          </p>
                        )}
                        {equipe.description && (
                          <p className="text-parchment-200/70 text-sm leading-relaxed">{equipe.description}</p>
                        )}
                      </div>

                      {/* Stats summary */}
                      {stat && (
                        <div className="flex gap-4 sm:gap-6 text-center flex-shrink-0">
                          {[
                            { label: 'V', value: stat.victoires, color: '#2ecc71' },
                            { label: 'D', value: stat.defaites, color: '#e74c3c' },
                            { label: 'N', value: stat.nulles, color: '#95a5a6' },
                            { label: 'Pts', value: stat.points, color },
                          ].map((s) => (
                            <div key={s.label}>
                              <div className="font-pirate font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
                              <div className="text-parchment-200/50 text-xs uppercase">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Roster */}
                  <div className="p-6 border-t" style={{ borderColor: `${color}20` }}>
                    <h3 className="font-pirate font-semibold text-lg mb-4" style={{ color: `${color}cc` }}>
                      ⚓ L&apos;Équipage
                    </h3>

                    {teamJoueurs.length === 0 ? (
                      <p className="text-parchment-200/40 text-sm italic">Composition à venir</p>
                    ) : (
                      <div className="space-y-4">
                        {/* Captain & Assistant */}
                        {(capitaine || assistant) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[capitaine, assistant].filter(Boolean).map((j: any) => (
                              <div
                                key={j.id}
                                className="flex items-center gap-3 p-3 rounded-lg"
                                style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                              >
                                {j.photo && (j.photo as any)?.filename ? (
                                  <Image
                                    src={`/media/${(j.photo as any).filename}`}
                                    alt={j.nom}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ background: `${color}30`, color }}
                                  >
                                    {j.nom[0]}
                                  </div>
                                )}
                                <div>
                                  <div className="font-pirate font-semibold text-parchment-100">{j.nom}</div>
                                  <div className="text-xs" style={{ color: `${color}99` }}>
                                    {j.role === 'capitaine' ? '👑 Capitaine' : '⚔️ Assistant'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Other players */}
                        {membres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {membres.map((j: any) => (
                              <div
                                key={j.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                                style={{
                                  background: `${color}10`,
                                  border: `1px solid ${color}25`,
                                  color: `${color}cc`,
                                }}
                              >
                                {j.photo && (j.photo as any)?.filename ? (
                                  <Image
                                    src={`/media/${(j.photo as any).filename}`}
                                    alt={j.nom}
                                    width={20}
                                    height={20}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="w-5 h-5 rounded-full bg-current/30 flex items-center justify-center text-xs font-bold">
                                    {j.nom[0]}
                                  </span>
                                )}
                                {j.nom}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/equipes/${equipe.slug}`}
                      className="inline-flex items-center gap-2 mt-4 text-sm transition-colors"
                      style={{ color: `${color}80` }}
                    >
                      Voir la fiche complète →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
