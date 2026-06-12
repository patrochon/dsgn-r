import Image from 'next/image'

interface HeroSectionProps {
  title: string
  subtitle?: string
  imageUrl?: string
  children?: React.ReactNode
  height?: 'full' | 'medium' | 'small'
  overlay?: boolean
}

export default function HeroSection({
  title,
  subtitle,
  imageUrl,
  children,
  height = 'medium',
  overlay = true,
}: HeroSectionProps) {
  const heights = {
    full: 'min-h-screen',
    medium: 'min-h-[60vh]',
    small: 'min-h-[40vh]',
  }

  return (
    <section
      className={`relative flex items-center justify-center ${heights[height]} wave-bg`}
      style={{
        background: imageUrl
          ? undefined
          : 'radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.08) 0%, transparent 70%), linear-gradient(180deg, #0a1628 0%, #050b14 100%)',
      }}
    >
      {/* Background image */}
      {imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 hero-overlay"
          style={{
            background: imageUrl
              ? 'linear-gradient(to bottom, rgba(5,11,20,0.6) 0%, rgba(5,11,20,0.3) 40%, rgba(5,11,20,0.85) 80%, rgba(5,11,20,1) 100%)'
              : undefined,
          }}
        />
      )}

      {/* Decorative compass */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-5">
        <div className="text-[40rem] leading-none select-none animate-sway" style={{ color: '#d4a853' }}>
          ⊕
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Decorative skull */}
        <div className="flex items-center justify-center gap-4 mb-6 text-gold-500/50">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-gold-500/40" />
          <span className="text-2xl animate-float">🏴‍☠️</span>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-gold-500/40" />
        </div>

        <h1
          className="font-pirate font-bold mb-4"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            background: 'linear-gradient(135deg, #d4a853 0%, #f0d875 50%, #d4a853 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-parchment-200/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </section>
  )
}
