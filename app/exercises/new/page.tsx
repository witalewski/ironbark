"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const TRACKING_TYPES = ["sets", "reps", "weight", "time"]

export default function NewExercisePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    description: "",
    videoLink: "",
    trackingTypes: [] as string[],
  })

  function toggleType(type: string) {
    setForm((f) => ({
      ...f,
      trackingTypes: f.trackingTypes.includes(type)
        ? f.trackingTypes.filter((t) => t !== type)
        : [...f.trackingTypes, type],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.trackingTypes.length === 0) {
      setError("Select at least one tracking type")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const exercise = await res.json()
      router.push(`/exercises/${exercise.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exercise")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 py-4">
        <Link href="/exercises" className="text-white/60 hover:text-white text-xs tracking-widest">
          ← BACK
        </Link>
        <h1 className="text-xl font-bold tracking-widest">NEW EXERCISE</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">NAME *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Push-up"
            className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">DESCRIPTION / NOTES</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Form cues, notes, variants..."
            rows={4}
            className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white placeholder:text-white/20 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">VIDEO LINK</label>
          <input
            type="url"
            value={form.videoLink}
            onChange={(e) => setForm((f) => ({ ...f, videoLink: e.target.value }))}
            placeholder="https://youtube.com/..."
            className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">TRACKING TYPES *</label>
          <div className="grid grid-cols-2 gap-2">
            {TRACKING_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`py-3 text-xs tracking-widest border transition-colors ${
                  form.trackingTypes.includes(type)
                    ? "bg-white text-black border-white"
                    : "bg-black text-white border-white/40 hover:border-white"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-400 tracking-widest">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-white px-4 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {loading ? "CREATING..." : "CREATE EXERCISE"}
        </button>
      </form>
    </div>
  )
}
