import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const exercise = await prisma.exercise.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(exercise)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, videoLink, trackingTypes } = await req.json()

  const exercise = await prisma.exercise.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.exercise.update({
    where: { id },
    data: {
      name: name || exercise.name,
      description: description ?? exercise.description,
      videoLink: videoLink ?? exercise.videoLink,
      trackingTypes: trackingTypes || exercise.trackingTypes,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const exercise = await prisma.exercise.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!exercise) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.exercise.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
