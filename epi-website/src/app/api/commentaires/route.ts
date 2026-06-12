import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || 'general'

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'commentaires',
      where: {
        and: [
          { approuve: { equals: true } },
          { page: { equals: page } },
        ],
      },
      sort: '-createdAt',
      limit: 50,
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ message: 'Erreur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { nom, email, message, page } = data

    if (!nom || !message) {
      return NextResponse.json({ message: 'Nom et message sont requis.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    await payload.create({
      collection: 'commentaires',
      data: {
        nom,
        email: email || undefined,
        message,
        page: page || 'general',
        approuve: false,
      },
    })

    return NextResponse.json({ success: true, message: 'Commentaire soumis et en attente d\'approbation.' }, { status: 201 })
  } catch (err) {
    console.error('Comment submission error:', err)
    return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 })
  }
}
