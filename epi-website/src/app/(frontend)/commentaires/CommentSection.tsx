'use client'
import { useEffect, useState } from 'react'

interface Comment {
  id: string
  nom: string
  message: string
  createdAt: string
  reponse_admin?: string
}

export default function CommentSection({ page = 'general' }: { page?: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nom: '', email: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetch(`/api/commentaires?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data?.docs || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('loading')
    try {
      const res = await fetch('/api/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, page }),
      })
      if (res.ok) {
        setSubmitStatus('success')
        setForm({ nom: '', email: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    }
  }

  return (
    <div>
      {/* Comments list */}
      <div className="mb-10">
        <h2 className="font-pirate font-bold text-2xl gold-text mb-6">
          ⚓ Messages de l&apos;équipage ({comments.length})
        </h2>

        {loading ? (
          <div className="text-center py-8 text-parchment-200/40 font-pirate">Chargement...</div>
        ) : comments.length === 0 ? (
          <div className="pirate-card p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-parchment-200/60 font-pirate">
              Soyez le premier à laisser un message!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="pirate-card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-pirate font-bold text-lg flex-shrink-0">
                    {comment.nom[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-pirate font-semibold text-parchment-100">{comment.nom}</span>
                      <span className="text-parchment-200/40 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString('fr-CA', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-parchment-200/80 leading-relaxed text-sm">{comment.message}</p>

                    {comment.reponse_admin && (
                      <div className="mt-3 pl-3 border-l-2 border-gold-500/40">
                        <div className="text-gold-500/70 text-xs font-pirate font-semibold mb-1">
                          ⚓ Réponse de l&apos;ÉPI
                        </div>
                        <p className="text-parchment-200/70 text-sm">{comment.reponse_admin}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New comment form */}
      <div className="pirate-card p-6">
        <h3 className="font-pirate font-bold text-xl text-gold-500 mb-5">
          📝 Laisser un commentaire
        </h3>

        {submitStatus === 'success' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-parchment-200/80 font-pirate">
              Commentaire soumis! Il sera visible après approbation.
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="btn-outline mt-4 text-sm"
            >
              Écrire un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="pirate-label">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                  className="pirate-input"
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div>
                <label className="pirate-label">Courriel (optionnel)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="pirate-input"
                  placeholder="Non affiché publiquement"
                />
              </div>
            </div>
            <div>
              <label className="pirate-label">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="pirate-input"
                rows={4}
                placeholder="Partagez vos impressions..."
                required
              />
            </div>
            {submitStatus === 'error' && (
              <p className="text-red-400 text-sm">⚠️ Une erreur est survenue. Réessayez.</p>
            )}
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="btn-gold disabled:opacity-50"
            >
              {submitStatus === 'loading' ? '⏳ Envoi...' : '⚓ Envoyer le message'}
            </button>
            <p className="text-parchment-200/40 text-xs">
              Les commentaires sont modérés avant publication.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
