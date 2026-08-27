import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'

export const metadata: Metadata = {
  title: 'Statistiques',
  description: 'Classement et statistiques des équipes de la ligue ÉPI',
}

export const dynamic = 'force-dynamic'

const TEAM_COLORS: Record<string, string> = {
  blanches: '#e8e8e8',
  blondes:  '#f4c430',
  stouts:   '#c8804a',
  rousses:  '#e74c3c',
}

const RANK_MEDALS = ['🥇', '🥈', '🥉', '4️⃣']

export default async function StatsPage() {
  const payload = await getPayloadClient()

  const [statsData, configData] = await Promise.all([
    payload.find({ collection: 'statistiques', depth: 2, limit: 40, sort: '-saison' }),
    payload.findGlobal({ slug: 'site-config' }),
  ])

  const allStats = statsData.docs
  const saison = (configData as any)?.saison_courante || ''

  // Get unique seasons
  const saisons = [...new Set(allStats.map((s: any) => s.saison))].sort().reverse()

  // Group stats by season
  const statsBySaison: Record<string, any[]> = {}
  allStats.forEach((s: any) => {
    if (!statsBySaison[s.saison]) statsBySaison[s.saison] = []
    statsBySaison[s.saison].push(s)
  })

  // Sort each season's stats by points desc
  Object.keys(statsBySaison).forEach((s) => {
    statsBySaison[s].sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
  })

  return (
    <>
      <HeroSection
        title="Statistiques"
        subtitle="Le tableau de bord de la ligue — qui mène la course au trophée?"
        height="small"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {saisons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏆</div>
            <p className="font-pirate text-2xl text-gold-500">Statistiques à venir!</p>
            <p className="text-parchment-200/60 mt-2">Les stats seront publiées dès le début de la saison.</p>
          </div>
        ) : (
          saisons.map((s: string) => {
            const stats = statsBySaison[s] || []
            const isCurrent = s === saison

            return (
              <section key={s} className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-pirate font-bold text-2xl gold-text">{s}</h2>
                  {isCurrent && (
                    <span className="text-xs bg-gold-500 text-navy-900 px-3 py-1 rounded-full font-bold font-pirate">
                      Saison en cours
                    </span>
                  )}
                </div>

                {/* Main standings table */}
                <div className="pirate-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold-500/20">
                          <th className="px-4 py-3 text-left text-gold-500 font-pirate text-xs uppercase tracking-widest">#</th>
                          <th className="px-4 py-3 text-left text-gold-500 font-pirate text-xs uppercase tracking-widest">Équipe</th>
                          <th className="px-4 py-3 text-center text-gold-500 font-pirate text-xs uppercase tracking-widest">V</th>
                          <th className="px-4 py-3 text-center text-gold-500 font-pirate text-xs uppercase tracking-widest">D</th>
                          <th className="px-4 py-3 text-center text-gold-500 font-pirate text-xs uppercase tracking-widest">N</th>
                          <th className="px-4 py-3 text-center text-gold-500 font-pirate text-xs uppercase tracking-widest">Cat.</th>
                          <th className="px-4 py-3 text-center text-gold-500 font-pirate text-xs uppercase tracking-widest">Pén.</th>
                          <th className="px-4 py-3 text-center text-gold-500 font-pirate text-xs uppercase tracking-widest font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map((stat: any, index: number) => {
                          const equipe = stat.equipe
                          const nom = typeof equipe === 'object' ? equipe.nom : 'Équipe'
                          const slug = typeof equipe === 'object' ? equipe.slug : ''
                          const color = (typeof equipe === 'object' && equipe.couleur) || TEAM_COLORS[slug] || '#d4a853'
                          const mvp = stat.meilleur_joueur
                          const total = (stat.victoires || 0) + (stat.defaites || 0) + (stat.nulles || 0)

                          return (
                            <tr
                              key={stat.id}
                              className="border-b border-gold-500/10 hover:bg-gold-500/5 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <span className="text-lg">{RANK_MEDALS[index] || `${index + 1}`}</span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ background: color }}
                                  />
                                  <div>
                                    <div className="font-pirate font-bold" style={{ color }}>
                                      {nom}
                                    </div>
                                    {mvp && typeof mvp === 'object' && (
                                      <div className="text-xs text-parchment-200/40">⭐ {mvp.nom}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-green-400 font-bold font-pirate">{stat.victoires ?? 0}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-red-400 font-bold font-pirate">{stat.defaites ?? 0}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-parchment-200/60 font-pirate">{stat.nulles ?? 0}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-gold-400/80 font-pirate">{stat.categories_gagnees ?? 0}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-red-400/60 font-pirate">{stat.penalites ?? 0}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div
                                  className="inline-flex items-center justify-center w-10 h-10 rounded-full font-pirate font-bold text-navy-900 text-lg"
                                  style={{ background: index === 0 ? '#d4a853' : index === 1 ? '#c0c0c0' : index === 2 ? '#c8804a' : '#333' }}
                                >
                                  {stat.points ?? 0}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Win rates visualization */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {stats.map((stat: any, index: number) => {
                    const equipe = stat.equipe
                    const nom = typeof equipe === 'object' ? equipe.nom : 'Équipe'
                    const slug = typeof equipe === 'object' ? equipe.slug : ''
                    const color = (typeof equipe === 'object' && equipe.couleur) || TEAM_COLORS[slug] || '#d4a853'
                    const total = (stat.victoires || 0) + (stat.defaites || 0) + (stat.nulles || 0)
                    const winRate = total > 0 ? Math.round((stat.victoires || 0) / total * 100) : 0

                    return (
                      <div key={stat.id} className="pirate-card p-4 text-center">
                        <div className="font-pirate font-bold text-sm mb-2" style={{ color }}>{nom}</div>
                        <div className="relative h-2 bg-navy-700 rounded-full overflow-hidden mb-2">
                          <div
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                            style={{ width: `${winRate}%`, background: color }}
                          />
                        </div>
                        <div className="text-2xl font-pirate font-bold" style={{ color }}>{winRate}%</div>
                        <div className="text-parchment-200/40 text-xs">taux de victoire</div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })
        )}
      </div>
    </>
  )
}
