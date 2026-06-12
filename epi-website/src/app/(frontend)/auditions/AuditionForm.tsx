'use client'
import { useState } from 'react'

export default function AuditionForm({ saison }: { saison: string }) {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    age: '',
    ville: '',
    experience_impro: '',
    description_experience: '',
    motivation: '',
    disponibilites: '',
    comment_connu: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/auditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: form.age ? Number(form.age) : undefined, saison }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setErrorMsg(data?.message || 'Une erreur est survenue.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Impossible de soumettre le formulaire. Vérifiez votre connexion.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="pirate-card p-8 text-center border-green-400/40">
        <div className="text-6xl mb-4">🏴‍☠️</div>
        <h2 className="font-pirate text-2xl font-bold text-gold-500 mb-3">
          Ahoy! Candidature reçue!
        </h2>
        <p className="text-parchment-200/80 leading-relaxed">
          Votre demande d&apos;audition a été soumise avec succès.
          L&apos;équipage vous contactera sous peu. Bon vent!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-pirate text-2xl font-bold gold-text mb-6">
        Formulaire d&apos;audition — {saison}
      </h2>

      {/* Personal info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="pirate-label">Nom complet *</label>
          <input
            name="nom"
            type="text"
            value={form.nom}
            onChange={handleChange}
            className="pirate-input"
            placeholder="Votre nom"
            required
          />
        </div>
        <div>
          <label className="pirate-label">Courriel *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="pirate-input"
            placeholder="votre@email.com"
            required
          />
        </div>
        <div>
          <label className="pirate-label">Téléphone</label>
          <input
            name="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange}
            className="pirate-input"
            placeholder="514-555-0000"
          />
        </div>
        <div>
          <label className="pirate-label">Âge</label>
          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            className="pirate-input"
            placeholder="25"
            min={14}
            max={99}
          />
        </div>
        <div>
          <label className="pirate-label">Ville</label>
          <input
            name="ville"
            type="text"
            value={form.ville}
            onChange={handleChange}
            className="pirate-input"
            placeholder="Montréal"
          />
        </div>
        <div>
          <label className="pirate-label">Expérience en impro</label>
          <select
            name="experience_impro"
            value={form.experience_impro}
            onChange={handleChange}
            className="pirate-select"
          >
            <option value="">Sélectionner...</option>
            <option value="aucune">Aucune</option>
            <option value="debutant">Débutant (moins de 1 an)</option>
            <option value="intermediaire">Intermédiaire (1–3 ans)</option>
            <option value="avance">Avancé (3–5 ans)</option>
            <option value="expert">Expert (5+ ans)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="pirate-label">Décrivez votre expérience en impro et en théâtre</label>
        <textarea
          name="description_experience"
          value={form.description_experience}
          onChange={handleChange}
          className="pirate-input"
          rows={3}
          placeholder="Ligues, cours, spectacles... Tout compte!"
        />
      </div>

      <div>
        <label className="pirate-label">Pourquoi voulez-vous rejoindre l&apos;ÉPI? *</label>
        <textarea
          name="motivation"
          value={form.motivation}
          onChange={handleChange}
          className="pirate-input"
          rows={4}
          placeholder="Parlez-nous de votre passion pour l'improvisation et ce qui vous attire vers notre ligue..."
          required
        />
      </div>

      <div>
        <label className="pirate-label">Vos disponibilités</label>
        <textarea
          name="disponibilites"
          value={form.disponibilites}
          onChange={handleChange}
          className="pirate-input"
          rows={2}
          placeholder="Les matchs ont généralement lieu les vendredis soirs..."
        />
      </div>

      <div>
        <label className="pirate-label">Comment avez-vous entendu parler de nous?</label>
        <input
          name="comment_connu"
          type="text"
          value={form.comment_connu}
          onChange={handleChange}
          className="pirate-input"
          placeholder="Facebook, ami, spectateur..."
        />
      </div>

      {status === 'error' && (
        <div className="pirate-card p-4 border-red-400/40 text-red-400 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-gold w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>⏳ Envoi en cours...</>
        ) : (
          <>🏴‍☠️ Soumettre ma candidature</>
        )}
      </button>

      <p className="text-parchment-200/40 text-xs text-center">
        En soumettant ce formulaire, vous acceptez d&apos;être contacté par l&apos;équipe ÉPI.
      </p>
    </form>
  )
}
