import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { nom, email, telephone, age, ville, experience_impro, description_experience, motivation, disponibilites, comment_connu, saison } = data

    if (!nom || !email || !motivation) {
      return NextResponse.json({ message: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    await payload.create({
      collection: 'auditions',
      data: {
        nom,
        email,
        telephone: telephone || undefined,
        age: age || undefined,
        ville: ville || undefined,
        experience_impro: experience_impro || undefined,
        description_experience: description_experience || undefined,
        motivation,
        disponibilites: disponibilites || undefined,
        comment_connu: comment_connu || undefined,
        saison: saison || undefined,
        statut: 'en_attente',
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Audition submission error:', err)
    return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
