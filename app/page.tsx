import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await auth()
  if (session) {
    redirect("/workouts")
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-widest">IRONBARK</h1>
          <p className="text-white/60 text-sm tracking-widest">EXERCISE TRACKER</p>
        </div>
        <div className="space-y-4">
          <div className="border border-white/20 p-6 space-y-2">
            <p className="text-xs text-white/60 tracking-widest">TRACK</p>
            <p className="text-sm">Log sets, reps, weight, time</p>
          </div>
          <div className="border border-white/20 p-6 space-y-2">
            <p className="text-xs text-white/60 tracking-widest">PLAN</p>
            <p className="text-sm">Build custom workouts</p>
          </div>
          <div className="border border-white/20 p-6 space-y-2">
            <p className="text-xs text-white/60 tracking-widest">REVIEW</p>
            <p className="text-sm">View session history</p>
          </div>
        </div>
        <Link
          href="/auth/signin"
          className="block border border-white px-8 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          GET STARTED
        </Link>
      </div>
    </div>
  )
}
