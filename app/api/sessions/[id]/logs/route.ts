import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workoutSession = await prisma.workoutSession.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workoutSession) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { exerciseId, sets } = await req.json()
  if (!exerciseId) return NextResponse.json({ error: "exerciseId required" }, { status: 400 })

  const log = await prisma.exerciseLog.create({
    data: {
      sessionId: id,
      exerciseId,
      sets: sets || [],
    },
  })
  return NextResponse.json(log, { status: 201 })
}
