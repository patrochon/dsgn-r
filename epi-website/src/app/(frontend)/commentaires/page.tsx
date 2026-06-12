import type { Metadata } from 'next'
import HeroSection from '@/components/HeroSection'
import CommentSection from './CommentSection'

export const metadata: Metadata = {
  title: 'Commentaires',
  description: 'Laissez un commentaire sur la ligue ÉPI',
}

export default function CommentairesPage() {
  return (
    <>
      <HeroSection
        title="Commentaires"
        subtitle="Partagez vos impressions sur nos matchs et notre ligue!"
        height="small"
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <CommentSection page="general" />
      </div>
    </>
  )
}
