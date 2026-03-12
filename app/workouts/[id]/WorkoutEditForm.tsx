"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Exercise {
  id: string
  name: string
  trackingTypes: string[]
}

interface WorkoutExercise {
  id: string
  exerciseId: string
  order: number
  targetSets: number | null
  notes: string | null
  exercise: Exercise
}

interface Workout {
  id: string
  name: string
  description: string | null
  workoutExercises: WorkoutExercise[]
}

interface SelectedExercise {
  exerciseId: string
  exercise: Exercise
  order: number
  targetSets: number
  notes: string
}

export default function WorkoutEditForm({
  workout,
  allExercises,
}: {
  workout: Workout
  allExercises: Exercise[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(workout.name)
  const [description, setDescription] = useState(workout.description || "")
  const [selected, setSelected] = useState<SelectedExercise[]>(
    workout.workoutExercises.map((we) => ({
      exerciseId: we.exerciseId,
      exercise: we.exercise,
      order: we.order,
      targetSets: we.targetSets || 3,
      notes: we.notes || "",
    }))
  )

  function addExercise(exercise: Exercise) {
    if (selected.find((s) => s.exerciseId === exercise.id)) return
    setSelected((s) => [
      ...s,
      { exerciseId: exercise.id, exercise, order: s.length, targetSets: 3, notes: "" },
    ])
  }

  function removeExercise(exerciseId: string) {
    setSelected((s) =>
      s.filter((e) => e.exerciseId !== exerciseId).map((e, i) => ({ ...e, order: i }))
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
    setLoading(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: "PUT",
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
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workout")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      router.push("/workouts")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workout")
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs tracking-widest text-white/60">DESCRIPTION</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-black border border-white/40 text-white px-3 py-3 text-sm focus:border-white resize-none"
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
        <div className="space-y-1 max-h-48 overflow-y-auto border border-white/10 p-2">
          {allExercises.map((exercise) => {
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
                    : "border-white/20 hover:border-white"
                }`}
              >
                {exercise.name}
                {isAdded && <span className="text-xs text-white/20 ml-2">ADDED</span>}
              </button>
            )
          })}
        </div>
      </div>

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
          {deleting ? "DELETING..." : "DELETE WORKOUT"}
        </button>
      </div>
    </form>
  )
}
