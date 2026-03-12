import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id },
    include: { workout: true, exerciseLogs: { include: { exercise: true } } },
    orderBy: { startedAt: "desc" },
    take: 20,
  })
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workoutId } = await req.json()
  if (!workoutId) return NextResponse.json({ error: "workoutId required" }, { status: 400 })

  const workoutSession = await prisma.workoutSession.create({
    data: {
      userId: session.user.id,
      workoutId,
    },
  })
  return NextResponse.json(workoutSession, { status: 201 })
}
