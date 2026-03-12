import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkoutTracker from "./WorkoutTracker"

export default async function TrackWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const workout = await prisma.workout.findFirst({
    where: { id, userId: session.user.id },
    include: {
      workoutExercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!workout) notFound()

  return <WorkoutTracker workout={workout} userId={session.user.id} />
}
