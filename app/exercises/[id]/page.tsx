import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import ExerciseEditForm from "./ExerciseEditForm"

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const exercise = await prisma.exercise.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!exercise) notFound()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 py-4">
        <Link href="/exercises" className="text-white/60 hover:text-white text-xs tracking-widest">
          ← BACK
        </Link>
        <h1 className="text-xl font-bold tracking-widest truncate">{exercise.name}</h1>
      </div>
      <ExerciseEditForm exercise={exercise} />
    </div>
  )
}
