import type { Metadata } from 'next'
import '../globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'ÉPI — Équipage de Piraterie Improvisé',
    template: '%s | ÉPI',
  },
  description: 'La ligue d\'improvisation ÉPI — Équipage de Piraterie Improvisé. Galerie photos, horaire des matchs, équipes et plus!',
  keywords: ['improvisation', 'théâtre', 'ligue', 'ÉPI', 'piraterie', 'impro'],
  openGraph: {
    siteName: 'ÉPI — Équipage de Piraterie Improvisé',
    type: 'website',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
