import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from '@/components/HeroSection'
import AuditionForm from './AuditionForm'

export const metadata: Metadata = {
  title: 'Auditions',
  description: 'Formulaire d\'inscription aux auditions de la ligue ÉPI',
}

export const dynamic = 'force-dynamic'

export default async function AuditionsPage() {
  const payload = await getPayloadClient()
  const config = await payload.findGlobal({ slug: 'site-config' }) as any

  const auditionsActives = config?.auditions_actives ?? false
  const messageBienvenue = config?.message_auditions || ''
  const saison = config?.saison_courante || 'Automne 2025'

  return (
    <>
      <HeroSection
        title="Auditions"
        subtitle={auditionsActives
          ? `Les auditions pour la saison ${saison} sont maintenant ouvertes!`
          : 'Informations sur les prochaines auditions'}
        height="small"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {auditionsActives ? (
          <>
            {messageBienvenue && (
              <div className="pirate-card p-6 mb-8 border-gold-500/40">
                <p className="text-parchment-200/80 leading-relaxed text-center font-pirate">
                  ⚓ {messageBienvenue}
                </p>
              </div>
            )}

            {/* Info boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: '🎭', title: 'Aucune expérience', desc: 'Les débutants sont les bienvenus!' },
                { icon: '🏴‍☠️', title: 'Esprit d\'équipe', desc: 'L\'impro, c\'est jouer ensemble' },
                { icon: '⚔️', title: 'Amusement garanti', desc: 'Rejoignez la plus fun des ligues' },
              ].map((item) => (
                <div key={item.title} className="pirate-card p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-pirate font-bold text-gold-500 text-sm mb-1">{item.title}</div>
                  <div className="text-parchment-200/60 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>

            <AuditionForm saison={saison} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-7xl mb-6">⚓</div>
            <h2 className="font-pirate text-3xl font-bold gold-text mb-4">
              Auditions fermées
            </h2>
            <p className="text-parchment-200/70 leading-relaxed max-w-md mx-auto mb-8">
              Les auditions pour rejoindre l&apos;ÉPI ont lieu chaque automne.
              Suivez notre page Facebook pour être parmi les premiers informés!
            </p>
            <div className="pirate-card p-6 max-w-sm mx-auto mb-8">
              <h3 className="font-pirate font-bold text-gold-500 mb-3">Processus d&apos;audition</h3>
              <ol className="text-parchment-200/70 text-sm space-y-2 text-left">
                <li>1. 📝 Remplir le formulaire en ligne</li>
                <li>2. 📞 Être contacté par l&apos;équipe</li>
                <li>3. 🎭 Participer à une audition de groupe</li>
                <li>4. 🏴‍☠️ Rejoindre l&apos;équipage!</li>
              </ol>
            </div>
            <a
              href="https://www.facebook.com/lepiyarr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex"
            >
              📘 Suivre sur Facebook pour les annonces
            </a>
          </div>
        )}
      </div>
    </>
  )
}
