import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workoutSession = await prisma.workoutSession.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workoutSession) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { completedAt, notes } = await req.json()

  const updated = await prisma.workoutSession.update({
    where: { id },
    data: {
      completedAt: completedAt ? new Date(completedAt) : undefined,
      notes: notes ?? workoutSession.notes,
    },
  })
  return NextResponse.json(updated)
}
