'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/horaire', label: 'Horaire' },
  { href: '/equipes', label: 'Équipes' },
  { href: '/stats', label: 'Statistiques' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/auditions', label: 'Auditions' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/90 backdrop-blur-sm border-b border-gold-500/20">
      {/* Announcement bar slot — rendered by page if needed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">🏴‍☠️</span>
            <div>
              <div className="font-pirate font-bold text-lg gold-text leading-none">ÉPI</div>
              <div className="text-xs text-parchment-200/60 leading-none hidden sm:block">
                Équipage de Piraterie Improvisé
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Facebook + Admin buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://www.facebook.com/lepiyarr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline py-1.5 px-3 text-xs"
            >
              <span>f</span> Facebook
            </a>
            <Link
              href="/admin"
              className="text-parchment-200/40 hover:text-gold-500/60 transition-colors text-xs"
            >
              Admin ⚓
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-parchment-100/70 hover:text-gold-500 transition-colors"
            aria-label="Menu"
          >
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ transform: menuOpen ? 'rotate(45deg) translate(2px, 5px)' : '' }} />
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ opacity: menuOpen ? 0 : 1 }} />
            <div className="w-5 h-0.5 bg-current transition-all" style={{ transform: menuOpen ? 'rotate(-45deg) translate(2px, -5px)' : '' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-navy-800 border-t border-gold-500/20 px-4 py-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`nav-link py-2 ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gold-500/20 mt-2 pt-3 flex gap-3">
              <a
                href="https://www.facebook.com/lepiyarr"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline py-1.5 px-3 text-xs"
              >
                Facebook
              </a>
              <Link href="/admin" className="text-parchment-200/40 text-xs self-center" onClick={() => setMenuOpen(false)}>
                Admin ⚓
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
