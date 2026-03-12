import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ExercisesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold tracking-widest">EXERCISES</h1>
        <Link
          href="/exercises/new"
          className="border border-white px-4 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          + NEW
        </Link>
      </div>

      {exercises.length === 0 ? (
        <div className="border border-white/20 p-8 text-center space-y-3">
          <p className="text-sm text-white/60">No exercises yet.</p>
          <Link
            href="/exercises/new"
            className="inline-block border border-white px-4 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            CREATE FIRST EXERCISE
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
              <div className="border border-white/20 p-4 hover:border-white transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-bold tracking-wide truncate">{exercise.name}</p>
                    {exercise.description && (
                      <p className="text-xs text-white/60 line-clamp-2">{exercise.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {exercise.trackingTypes.map((type) => (
                        <span key={type} className="text-xs border border-white/30 px-2 py-0.5 tracking-widest">
                          {type.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-white/40 text-xs ml-2 shrink-0">›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
