import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    include: { workoutExercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(workouts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, exercises } = await req.json()
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const workout = await prisma.workout.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null,
      workoutExercises: {
        create: exercises?.map((e: { exerciseId: string; order: number; targetSets?: number; notes?: string }) => ({
          exerciseId: e.exerciseId,
          order: e.order,
          targetSets: e.targetSets || 3,
          notes: e.notes || null,
        })) || [],
      },
    },
    include: { workoutExercises: true },
  })
  return NextResponse.json(workout, { status: 201 })
}
