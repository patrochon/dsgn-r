import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'

export const metadata: Metadata = {
  title: 'Galerie Photos',
  description: 'Galerie visuelle des matchs de la ligue d\'improvisation ÉPI',
}

export const dynamic = 'force-dynamic'

export default async function GaleriePage() {
  const payload = await getPayloadClient()

  const [matchsData, photosData] = await Promise.all([
    payload.find({
      collection: 'matchs',
      where: { statut: { equals: 'termine' } },
      sort: '-date',
      depth: 1,
      limit: 20,
    }),
    payload.find({
      collection: 'photos',
      depth: 2,
      limit: 100,
      sort: '-createdAt',
    }),
  ])

  const matchs = matchsData.docs
  const allPhotos = photosData.docs

  // Group photos by match
  const photosByMatch: Record<string, any[]> = {}
  const orphanPhotos: any[] = []

  allPhotos.forEach((photo: any) => {
    if (photo.match && typeof photo.match === 'object') {
      const matchId = photo.match.id
      if (!photosByMatch[matchId]) photosByMatch[matchId] = []
      photosByMatch[matchId].push(photo)
    } else {
      orphanPhotos.push(photo)
    }
  })

  return (
    <>
      <HeroSection
        title="Galerie ÉPI"
        subtitle="Chaque photo raconte une aventure. Revivez les meilleurs moments de nos matchs."
        height="small"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Matches with photos */}
        {matchs.map((match: any) => {
          const photos = photosByMatch[match.id] || []
          if (photos.length === 0) return null
          return (
            <section key={match.id} className="mb-16">
              {/* Match header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-gold-500/60 text-xs font-pirate uppercase tracking-widest mb-1">
                    {match.saison} · {new Date(match.date).toLocaleDateString('fr-CA', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                  <h2 className="font-pirate font-bold text-2xl text-parchment-100">
                    {match.titre}
                  </h2>
                  {match.lieu && (
                    <div className="text-parchment-200/50 text-sm mt-1">📍 {match.lieu}</div>
                  )}
                </div>
                <div className="text-gold-500/60 font-pirate">
                  {photos.length} photo{photos.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo: any, index: number) => {
                  const img = photo.image
                  const src = typeof img === 'object' && img?.filename ? `/media/${img.filename}` : null
                  const thumb = typeof img === 'object' && img?.sizes?.thumbnail?.filename
                    ? `/media/${img.sizes.thumbnail.filename}` : src
                  if (!src) return null
                  return (
                    <a
                      key={photo.id}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gallery-item"
                    >
                      <Image
                        src={thumb || src}
                        alt={photo.legende || `Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="overlay">
                        {photo.legende && (
                          <p className="text-parchment-100 text-xs">{photo.legende}</p>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Orphan photos (not tied to a match) */}
        {orphanPhotos.length > 0 && (
          <section className="mb-16">
            <h2 className="font-pirate font-bold text-2xl text-parchment-100 mb-6">
              📸 Autres Photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {orphanPhotos.map((photo: any, index: number) => {
                const img = photo.image
                const src = typeof img === 'object' && img?.filename ? `/media/${img.filename}` : null
                const thumb = typeof img === 'object' && img?.sizes?.thumbnail?.filename
                  ? `/media/${img.sizes.thumbnail.filename}` : src
                if (!src) return null
                return (
                  <a
                    key={photo.id}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gallery-item"
                  >
                    <Image
                      src={thumb || src}
                      alt={photo.legende || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="overlay">
                      {photo.legende && (
                        <p className="text-parchment-100 text-xs">{photo.legende}</p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {matchs.every((m: any) => !photosByMatch[m.id]?.length) && orphanPhotos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="font-pirate text-2xl text-gold-500 mb-3">Galerie vide pour l&apos;instant</h3>
            <p className="text-parchment-200/60">Les photos des prochains matchs seront ajoutées ici.</p>
            <Link href="/" className="btn-outline mt-6 inline-flex">← Retour à l&apos;accueil</Link>
          </div>
        )}
      </div>
    </>
  )
}
