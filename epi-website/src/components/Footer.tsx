import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 border-t border-gold-500/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏴‍☠️</span>
              <div>
                <div className="font-pirate font-bold text-xl gold-text">ÉPI</div>
                <div className="text-xs text-parchment-200/50">Équipage de Piraterie Improvisé</div>
              </div>
            </div>
            <p className="text-parchment-200/60 text-sm leading-relaxed">
              La ligue d&apos;improvisation qui navigue sur les mers du théâtre.
              Quatre équipes, un seul trophée, mille aventures.
            </p>
            <a
              href="https://www.facebook.com/lepiyarr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-gold-500 hover:text-gold-300 transition-colors text-sm font-medium"
            >
              <span className="text-lg">📘</span>
              Suivez-nous sur Facebook
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-pirate text-gold-500 font-semibold mb-4 uppercase tracking-wide text-sm">
              Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/galerie', label: 'Galerie' },
                { href: '/horaire', label: 'Horaire' },
                { href: '/equipes', label: 'Équipes' },
                { href: '/stats', label: 'Statistiques' },
                { href: '/actualites', label: 'Actualités' },
                { href: '/auditions', label: 'Auditions' },
                { href: '/commentaires', label: 'Commentaires' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-parchment-200/60 hover:text-gold-400 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div>
            <h4 className="font-pirate text-gold-500 font-semibold mb-4 uppercase tracking-wide text-sm">
              Les Équipes
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { slug: 'blanches', name: 'Les Blanches', color: '#e8e8e8' },
                { slug: 'blondes',  name: 'Les Blondes',  color: '#f4c430' },
                { slug: 'stouts',   name: 'Les Stouts',   color: '#c8804a' },
                { slug: 'rousses',  name: 'Les Rousses',  color: '#e74c3c' },
              ].map((team) => (
                <Link
                  key={team.slug}
                  href={`/equipes/${team.slug}`}
                  className="flex items-center gap-2 text-parchment-200/60 hover:text-parchment-100 transition-colors text-sm group"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: team.color }}
                  />
                  {team.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gold-500/20 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-parchment-200/40 text-xs text-center">
            ⚓ © {year} ÉPI — Équipage de Piraterie Improvisé. Tous droits réservés.
          </p>
          <Link
            href="/admin"
            className="text-parchment-200/20 hover:text-parchment-200/40 transition-colors text-xs"
          >
            Administration
          </Link>
        </div>
      </div>
    </footer>
  )
}
