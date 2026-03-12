import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function SessionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: session.user.id },
    include: {
      workout: true,
      exerciseLogs: { include: { exercise: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 20,
  })

  return (
    <div className="p-4 space-y-4">
      <div className="py-4">
        <h1 className="text-xl font-bold tracking-widest">HISTORY</h1>
        <p className="text-xs text-white/60">{sessions.length} sessions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="border border-white/20 p-8 text-center space-y-3">
          <p className="text-sm text-white/60">No sessions yet.</p>
          <Link
            href="/workouts"
            className="inline-block border border-white px-4 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            START A WORKOUT
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const duration = s.completedAt
              ? Math.floor((s.completedAt.getTime() - s.startedAt.getTime()) / 1000)
              : null
            const totalSets = s.exerciseLogs.reduce(
              (acc, log) => acc + (Array.isArray(log.sets) ? (log.sets as Array<{completed?: boolean}>).filter((set) => set.completed).length : 0),
              0
            )
            return (
              <div key={s.id} className="border border-white/20 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold tracking-wide">{s.workout.name}</p>
                    <p className="text-xs text-white/60">
                      {new Date(s.startedAt).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {s.completedAt ? (
                      <span className="text-xs text-white/60">✓ DONE</span>
                    ) : (
                      <span className="text-xs text-white/40">IN PROGRESS</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  {duration && (
                    <span>
                      {Math.floor(duration / 60)}m {duration % 60}s
                    </span>
                  )}
                  <span>{s.exerciseLogs.length} exercises</span>
                  <span>{totalSets} sets done</span>
                </div>
                {s.exerciseLogs.length > 0 && (
                  <div className="space-y-1 border-t border-white/10 pt-2">
                    {s.exerciseLogs.map((log) => {
                      const sets = Array.isArray(log.sets) ? (log.sets as Array<{completed?: boolean; reps?: number; weight?: number; time?: number}>) : []
                      const completedSets = sets.filter((set) => set.completed)
                      return (
                        <div key={log.id} className="text-xs text-white/60">
                          <span className="text-white/80">{log.exercise.name}</span>
                          <span className="ml-2">
                            {completedSets.map((set, i) => {
                              const parts: string[] = []
                              if (set.reps !== undefined) parts.push(`${set.reps}r`)
                              if (set.weight !== undefined) parts.push(`${set.weight}kg`)
                              if (set.time !== undefined) parts.push(`${set.time}s`)
                              return parts.length > 0 ? (
                                <span key={i} className="mr-1">[{parts.join(" ")}]</span>
                              ) : null
                            })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
