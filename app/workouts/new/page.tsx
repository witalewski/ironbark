import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NewWorkoutForm from "./NewWorkoutForm"

export default async function NewWorkoutPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  })

  return <NewWorkoutForm exercises={exercises} />
}
