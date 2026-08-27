import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'

export const metadata: Metadata = {
  title: 'Horaire des matchs',
  description: 'Calendrier des matchs et événements de la ligue ÉPI',
}

export const dynamic = 'force-dynamic'

const TYPE_ICONS: Record<string, string> = {
  match:        '⚔️',
  audition:     '🎭',
  entrainement: '⚓',
  tournoi:      '🏆',
  special:      '🎉',
  social:       '🍻',
}

const TYPE_COLORS: Record<string, string> = {
  match:        '#d4a853',
  audition:     '#9b59b6',
  entrainement: '#3498db',
  tournoi:      '#e74c3c',
  special:      '#2ecc71',
  social:       '#f39c12',
}

export default async function HorairePage() {
  const payload = await getPayloadClient()

  const [evenementsData, configData] = await Promise.all([
    payload.find({
      collection: 'horaire',
      where: { visible: { equals: true } },
      sort: 'date',
      limit: 50,
      depth: 2,
    }),
    payload.findGlobal({ slug: 'site-config' }),
  ])

  const evenements = evenementsData.docs
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const aVenir = evenements.filter((e: any) => new Date(e.date) >= today)
  const passes = evenements.filter((e: any) => new Date(e.date) < today).reverse()

  // Group upcoming by month
  const parMois: Record<string, any[]> = {}
  aVenir.forEach((ev: any) => {
    const d = new Date(ev.date)
    const key = d.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric' })
    if (!parMois[key]) parMois[key] = []
    parMois[key].push(ev)
  })

  return (
    <>
      <HeroSection
        title="Horaire de la Saison"
        subtitle={`Tous les événements de la saison ${configData?.saison_courante || ''}. Marquez votre calendrier!`}
        height="small"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Upcoming events */}
        {aVenir.length > 0 ? (
          <>
            <h2 className="section-title text-left" style={{ textAlign: 'left' }}>
              Prochains événements
            </h2>
            <div className="h-px bg-gradient-to-r from-gold-500/40 to-transparent mb-8" />

            {Object.entries(parMois).map(([mois, evs]) => (
              <div key={mois} className="mb-10">
                <h3 className="font-pirate text-gold-500/80 text-lg font-semibold capitalize mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold-500/60 flex-shrink-0" />
                  {mois}
                </h3>
                <div className="space-y-4">
                  {evs.map((ev: any) => {
                    const date = new Date(ev.date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isSoon = (date.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

                    return (
                      <div
                        key={ev.id}
                        className="pirate-card p-5 flex gap-5"
                        style={{
                          borderLeftColor: TYPE_COLORS[ev.type] || '#d4a853',
                          borderLeftWidth: 3,
                        }}
                      >
                        {/* Date block */}
                        <div className="text-center flex-shrink-0 w-12">
                          <div
                            className="text-2xl font-pirate font-bold leading-none"
                            style={{ color: TYPE_COLORS[ev.type] || '#d4a853' }}
                          >
                            {date.getDate()}
                          </div>
                          <div className="text-parchment-200/50 text-xs uppercase">
                            {date.toLocaleDateString('fr-CA', { month: 'short' })}
                          </div>
                          <div className="text-parchment-200/40 text-xs">
                            {date.toLocaleDateString('fr-CA', { weekday: 'short' })}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-lg">{TYPE_ICONS[ev.type] || '📅'}</span>
                            <h4 className="font-pirate font-bold text-parchment-100 text-base">
                              {ev.titre}
                            </h4>
                            {isToday && (
                              <span className="text-xs bg-gold-500 text-navy-900 px-2 py-0.5 rounded-full font-bold font-pirate">
                                Aujourd&apos;hui!
                              </span>
                            )}
                            {!isToday && isSoon && (
                              <span className="text-xs border border-gold-500/50 text-gold-500 px-2 py-0.5 rounded-full font-pirate">
                                Bientôt
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-parchment-200/60">
                            {ev.heure_fin && (
                              <span className="flex items-center gap-1">
                                🕐 {date.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {ev.lieu && (
                              <span className="flex items-center gap-1">
                                📍 {ev.lieu}
                              </span>
                            )}
                            {ev.prix_entree && (
                              <span className="flex items-center gap-1">
                                🎟 {ev.prix_entree}
                              </span>
                            )}
                          </div>

                          {ev.description && (
                            <p className="text-parchment-200/50 text-sm mt-2 leading-relaxed">
                              {ev.description}
                            </p>
                          )}

                          {ev.lien_billets && (
                            <a
                              href={ev.lien_billets}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-gold-500 hover:text-gold-300 text-sm mt-2 transition-colors"
                            >
                              🎟 Obtenir des billets →
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-pirate text-2xl text-gold-500 mb-3">Aucun événement à venir</p>
            <p className="text-parchment-200/60">Les prochains événements seront annoncés bientôt.</p>
          </div>
        )}

        {/* Past events */}
        {passes.length > 0 && (
          <details className="mt-12">
            <summary className="font-pirate text-gold-500/60 cursor-pointer text-lg hover:text-gold-500 transition-colors py-4 border-t border-gold-500/20">
              ⚓ Événements passés ({passes.length})
            </summary>
            <div className="mt-6 space-y-3 opacity-60">
              {passes.map((ev: any) => {
                const date = new Date(ev.date)
                return (
                  <div key={ev.id} className="flex items-center gap-4 py-3 border-b border-gold-500/10">
                    <span className="text-sm text-parchment-200/50 w-28 flex-shrink-0">
                      {date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-lg">{TYPE_ICONS[ev.type] || '📅'}</span>
                    <span className="text-parchment-200/70 font-pirate">{ev.titre}</span>
                    {ev.lieu && <span className="text-parchment-200/40 text-sm hidden sm:block">· {ev.lieu}</span>}
                  </div>
                )
              })}
            </div>
          </details>
        )}

        {evenements.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚓</div>
            <h3 className="font-pirate text-2xl text-gold-500 mb-3">Horaire à venir</h3>
            <p className="text-parchment-200/60">L&apos;horaire de la prochaine saison sera publié bientôt.</p>
          </div>
        )}
      </div>
    </>
  )
}
