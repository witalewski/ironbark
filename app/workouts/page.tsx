import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function WorkoutsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    include: { workoutExercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold tracking-widest">WORKOUTS</h1>
        <Link
          href="/workouts/new"
          className="border border-white px-4 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          + NEW
        </Link>
      </div>

      {workouts.length === 0 ? (
        <div className="border border-white/20 p-8 text-center space-y-3">
          <p className="text-sm text-white/60">No workouts yet.</p>
          <Link
            href="/workouts/new"
            className="inline-block border border-white px-4 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            CREATE FIRST WORKOUT
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map((workout) => (
            <div key={workout.id} className="border border-white/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold tracking-wide">{workout.name}</p>
                  {workout.description && (
                    <p className="text-xs text-white/60 mt-1">{workout.description}</p>
                  )}
                  <p className="text-xs text-white/40 mt-1">
                    {workout.workoutExercises.length} exercise{workout.workoutExercises.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/workouts/${workout.id}/track`}
                  className="flex-1 border border-white px-4 py-2 text-xs tracking-widest text-center hover:bg-white hover:text-black transition-colors"
                >
                  START
                </Link>
                <Link
                  href={`/workouts/${workout.id}`}
                  className="border border-white/20 px-4 py-2 text-xs tracking-widest hover:border-white transition-colors"
                >
                  EDIT
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
