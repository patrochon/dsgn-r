import type { Metadata } from 'next'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Dernières nouvelles de la ligue ÉPI',
}

export const dynamic = 'force-dynamic'

const CAT_ICONS: Record<string, string> = {
  annonce: '📢',
  match: '⚔️',
  resultat: '🏆',
  audition: '🎭',
  evenement: '🎉',
}

export default async function ActualitesPage() {
  const payload = await getPayloadClient()
  const data = await payload.find({
    collection: 'actualites',
    where: { publie: { equals: true } },
    sort: '-date_publication',
    depth: 2,
    limit: 20,
  })
  const actualites = data.docs

  return (
    <>
      <HeroSection
        title="Actualités"
        subtitle="Toutes les nouvelles de l'Équipage de Piraterie Improvisé"
        height="small"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {actualites.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <p className="font-pirate text-2xl text-gold-500">Aucune actualité pour l&apos;instant</p>
          </div>
        ) : (
          <div className="space-y-8">
            {actualites.map((actu: any) => (
              <article key={actu.id} className="pirate-card overflow-hidden">
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
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{CAT_ICONS[actu.categorie] || '📰'}</span>
                    <span className="text-gold-500/60 text-xs font-pirate uppercase tracking-widest">
                      {actu.categorie}
                    </span>
                    {actu.date_publication && (
                      <span className="text-parchment-200/40 text-xs">
                        · {new Date(actu.date_publication).toLocaleDateString('fr-CA', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <h2 className="font-pirate font-bold text-2xl text-parchment-100 mb-3">
                    {actu.titre}
                  </h2>
                  {actu.extrait && (
                    <p className="text-parchment-200/70 leading-relaxed">{actu.extrait}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
