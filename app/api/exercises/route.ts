import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(exercises)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, videoLink, trackingTypes } = await req.json()
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null,
      videoLink: videoLink || null,
      trackingTypes: trackingTypes || [],
    },
  })
  return NextResponse.json(exercise, { status: 201 })
}
