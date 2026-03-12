import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  const { id, logId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workoutSession = await prisma.workoutSession.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workoutSession) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { sets, completedAt, notes } = await req.json()

  const log = await prisma.exerciseLog.update({
    where: { id: logId, sessionId: id },
    data: {
      sets: sets || [],
      completedAt: completedAt ? new Date(completedAt) : null,
      notes: notes ?? undefined,
    },
  })
  return NextResponse.json(log)
}
