"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/workouts",
      })
      if (result?.error) {
        setError("Failed to send email. Please try again.")
      } else {
        window.location.href = "/auth/verify"
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-widest">SIGN IN</h1>
          <p className="text-white/60 text-xs tracking-widest">ENTER YOUR EMAIL TO RECEIVE A SIGN IN LINK</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs tracking-widest text-white/60">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white placeholder:text-white/20"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 tracking-widest">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-white px-4 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? "SENDING..." : "SEND LINK"}
          </button>
        </form>
      </div>
    </div>
  )
}
