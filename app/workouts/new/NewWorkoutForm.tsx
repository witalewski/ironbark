"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Exercise {
  id: string
  name: string
  trackingTypes: string[]
}

interface WorkoutExerciseItem {
  exerciseId: string
  exercise: Exercise
  order: number
  targetSets: number
  notes: string
}

export default function NewWorkoutForm({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selected, setSelected] = useState<WorkoutExerciseItem[]>([])

  function addExercise(exercise: Exercise) {
    if (selected.find((s) => s.exerciseId === exercise.id)) return
    setSelected((s) => [
      ...s,
      { exerciseId: exercise.id, exercise, order: s.length, targetSets: 3, notes: "" },
    ])
  }

  function removeExercise(exerciseId: string) {
    setSelected((s) =>
      s
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, i) => ({ ...e, order: i }))
    )
  }

  function moveUp(index: number) {
    if (index === 0) return
    setSelected((s) => {
      const arr = [...s]
      ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      return arr.map((e, i) => ({ ...e, order: i }))
    })
  }

  function moveDown(index: number) {
    if (index === selected.length - 1) return
    setSelected((s) => {
      const arr = [...s]
      ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      return arr.map((e, i) => ({ ...e, order: i }))
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.length === 0) {
      setError("Add at least one exercise")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          exercises: selected.map((s) => ({
            exerciseId: s.exerciseId,
            order: s.order,
            targetSets: s.targetSets,
            notes: s.notes,
          })),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push("/workouts")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 py-4">
        <Link href="/workouts" className="text-white/60 hover:text-white text-xs tracking-widest">
          ← BACK
        </Link>
        <h1 className="text-xl font-bold tracking-widest">NEW WORKOUT</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">NAME *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Full-body A"
            className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white placeholder:text-white/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes about this workout..."
            rows={3}
            className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white placeholder:text-white/20 resize-none"
          />
        </div>

        {selected.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs tracking-widest text-white/60">EXERCISES ({selected.length})</label>
            <div className="space-y-2">
              {selected.map((item, index) => (
                <div key={item.exerciseId} className="border border-white/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{index + 1}. {item.exercise.name}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveUp(index)} className="px-2 py-1 text-xs text-white/40 hover:text-white">↑</button>
                      <button type="button" onClick={() => moveDown(index)} className="px-2 py-1 text-xs text-white/40 hover:text-white">↓</button>
                      <button type="button" onClick={() => removeExercise(item.exerciseId)} className="px-2 py-1 text-xs text-white/40 hover:text-red-400">✕</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-white/60">TARGET SETS</label>
                    <input
                      type="number"
                      min={1}
                      value={item.targetSets}
                      onChange={(e) =>
                        setSelected((s) =>
                          s.map((x) => x.exerciseId === item.exerciseId ? { ...x, targetSets: parseInt(e.target.value) || 1 } : x)
                        )
                      }
                      className="w-16 bg-black border border-white/40 text-white px-2 py-1 text-sm text-center focus:border-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs tracking-widest text-white/60">ADD EXERCISES</label>
          {exercises.length === 0 ? (
            <p className="text-xs text-white/40">
              No exercises yet.{" "}
              <Link href="/exercises/new" className="underline">Create one first.</Link>
            </p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto border border-white/10 p-2">
              {exercises.map((exercise) => {
                const isAdded = selected.some((s) => s.exerciseId === exercise.id)
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => addExercise(exercise)}
                    disabled={isAdded}
                    className={`w-full text-left px-3 py-2 text-sm border transition-colors ${
                      isAdded
                        ? "border-white/10 text-white/20 cursor-default"
                        : "border-white/20 hover:border-white hover:text-white"
                    }`}
                  >
                    {exercise.name}
                    <span className="text-xs text-white/40 ml-2">
                      [{exercise.trackingTypes.join(", ")}]
                    </span>
                    {isAdded && <span className="text-xs text-white/20 ml-2">ADDED</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400 tracking-widest">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-white px-4 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {loading ? "CREATING..." : "CREATE WORKOUT"}
        </button>
      </form>
    </div>
  )
}
