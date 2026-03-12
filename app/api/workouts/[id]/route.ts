import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: { workoutExercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
  })
  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(workout)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, exercises } = await req.json()

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.workoutExercise.deleteMany({ where: { workoutId: id } })

  const updated = await prisma.workout.update({
    where: { id },
    data: {
      name: name || workout.name,
      description: description ?? workout.description,
      workoutExercises: {
        create: exercises?.map((e: { exerciseId: string; order: number; targetSets?: number; notes?: string }) => ({
          exerciseId: e.exerciseId,
          order: e.order,
          targetSets: e.targetSets || 3,
          notes: e.notes || null,
        })) || [],
      },
    },
    include: { workoutExercises: { include: { exercise: true } } },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workout) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.workout.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
