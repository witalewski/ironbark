"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const TRACKING_TYPES = ["sets", "reps", "weight", "time"]

interface Exercise {
  id: string
  name: string
  description: string | null
  videoLink: string | null
  trackingTypes: string[]
}

export default function ExerciseEditForm({ exercise }: { exercise: Exercise }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: exercise.name,
    description: exercise.description || "",
    videoLink: exercise.videoLink || "",
    trackingTypes: exercise.trackingTypes,
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
    setSaved(false)
    try {
      const res = await fetch(`/api/exercises/${exercise.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update exercise")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/exercises/${exercise.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      router.push("/exercises")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete exercise")
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs tracking-widest text-white/60">NAME *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-widest text-white/60">DESCRIPTION / NOTES</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-widest text-white/60">VIDEO LINK</label>
        <input
          type="url"
          value={form.videoLink}
          onChange={(e) => setForm((f) => ({ ...f, videoLink: e.target.value }))}
          className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white"
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

      {form.videoLink && (
        <a
          href={form.videoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-white/20 px-4 py-3 text-xs tracking-widest text-center hover:border-white transition-colors"
        >
          ▶ VIEW VIDEO
        </a>
      )}

      {error && <p className="text-xs text-red-400 tracking-widest">{error}</p>}
      {saved && <p className="text-xs text-green-400 tracking-widest">SAVED</p>}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-white px-4 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {loading ? "SAVING..." : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full border border-white/20 px-4 py-3 text-sm tracking-widest text-white/40 hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {deleting ? "DELETING..." : "DELETE EXERCISE"}
        </button>
      </div>
    </form>
  )
}
