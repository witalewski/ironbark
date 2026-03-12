import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import WorkoutEditForm from "./WorkoutEditForm"

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const [workout, exercises] = await Promise.all([
    prisma.workout.findFirst({
      where: { id, userId: session.user.id },
      include: {
        workoutExercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ])

  if (!workout) notFound()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 py-4">
        <Link href="/workouts" className="text-white/60 hover:text-white text-xs tracking-widest">
          ← BACK
        </Link>
        <h1 className="text-xl font-bold tracking-widest truncate">{workout.name}</h1>
      </div>
      <Link
        href={`/workouts/${id}/track`}
        className="block border border-white px-4 py-3 text-sm tracking-widest text-center hover:bg-white hover:text-black transition-colors"
      >
        START WORKOUT
      </Link>
      <WorkoutEditForm workout={workout} allExercises={exercises} />
    </div>
  )
}
