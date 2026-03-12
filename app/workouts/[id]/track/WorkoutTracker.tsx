"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Timer from "@/components/Timer"

interface Exercise {
  id: string
  name: string
  description: string | null
  videoLink: string | null
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
  workoutExercises: WorkoutExercise[]
}

interface SetEntry {
  reps?: number
  weight?: number
  time?: number
  completed: boolean
}

interface ExerciseState {
  exerciseId: string
  sets: SetEntry[]
  expanded: boolean
  timerMode: "off" | "exercise" | "break" | "emom"
  emomInterval: number
  logId?: string
}

function createDefaultSet(trackingTypes: string[]): SetEntry {
  return {
    reps: trackingTypes.includes("reps") ? 0 : undefined,
    weight: trackingTypes.includes("weight") ? 0 : undefined,
    time: trackingTypes.includes("time") ? 0 : undefined,
    completed: false,
  }
}

export default function WorkoutTracker({ workout, userId }: { workout: Workout; userId: string }) {
  void userId
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [exerciseStates, setExerciseStates] = useState<ExerciseState[]>(
    workout.workoutExercises.map((we) => ({
      exerciseId: we.exerciseId,
      sets: Array.from({ length: we.targetSets || 3 }, () =>
        createDefaultSet(we.exercise.trackingTypes)
      ),
      expanded: false,
      timerMode: "off" as const,
      emomInterval: 60,
    }))
  )
  const [finishing, setFinishing] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionStartTimeRef = useRef<number>(0)

  const startSession = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: workout.id }),
      })
      if (!res.ok) return
      const session = await res.json()
      setSessionId(session.id)
      sessionStartTimeRef.current = Date.now()
      sessionTimerRef.current = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - sessionStartTimeRef.current) / 1000))
      }, 1000)
    } catch {
      // ignore
    }
  }, [workout.id])

  useEffect(() => {
    startSession() // eslint-disable-line react-hooks/set-state-in-effect
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    }
  }, [startSession])

  function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  function toggleExpand(exerciseId: string) {
    setExerciseStates((states) =>
      states.map((s) =>
        s.exerciseId === exerciseId ? { ...s, expanded: !s.expanded } : s
      )
    )
  }

  function addSet(exerciseId: string, trackingTypes: string[]) {
    setExerciseStates((states) =>
      states.map((s) =>
        s.exerciseId === exerciseId
          ? { ...s, sets: [...s.sets, createDefaultSet(trackingTypes)] }
          : s
      )
    )
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setExerciseStates((states) =>
      states.map((s) =>
        s.exerciseId === exerciseId
          ? { ...s, sets: s.sets.filter((_, i) => i !== setIndex) }
          : s
      )
    )
  }

  function updateSet(exerciseId: string, setIndex: number, update: Partial<SetEntry>) {
    setExerciseStates((states) =>
      states.map((s) =>
        s.exerciseId === exerciseId
          ? {
              ...s,
              sets: s.sets.map((set, i) => (i === setIndex ? { ...set, ...update } : set)),
            }
          : s
      )
    )
  }

  function toggleSetComplete(exerciseId: string, setIndex: number) {
    setExerciseStates((states) =>
      states.map((s) =>
        s.exerciseId === exerciseId
          ? {
              ...s,
              sets: s.sets.map((set, i) =>
                i === setIndex ? { ...set, completed: !set.completed } : set
              ),
            }
          : s
      )
    )
  }

  function setTimerMode(exerciseId: string, mode: ExerciseState["timerMode"]) {
    setExerciseStates((states) =>
      states.map((s) => (s.exerciseId === exerciseId ? { ...s, timerMode: mode } : s))
    )
  }

  async function saveExerciseLog(exerciseId: string, currentStates: ExerciseState[]) {
    if (!sessionId) return
    const state = currentStates.find((s) => s.exerciseId === exerciseId)
    if (!state) return
    try {
      const url = state.logId
        ? `/api/sessions/${sessionId}/logs/${state.logId}`
        : `/api/sessions/${sessionId}/logs`
      const method = state.logId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, sets: state.sets }),
      })
      if (res.ok) {
        const log = await res.json()
        setExerciseStates((states) =>
          states.map((s) => (s.exerciseId === exerciseId ? { ...s, logId: log.id } : s))
        )
      }
    } catch {
      // ignore
    }
  }

  async function finishSession() {
    setFinishing(true)
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)

    const currentStates = exerciseStates
    for (const state of currentStates) {
      await saveExerciseLog(state.exerciseId, currentStates)
    }

    if (sessionId) {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      })
    }

    router.push("/sessions")
  }

  const completedExercises = exerciseStates.filter((s) =>
    s.sets.length > 0 && s.sets.every((set) => set.completed)
  ).length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-lg font-bold tracking-widest">{workout.name}</h1>
          <p className="text-xs text-white/60 tracking-widest">
            {formatDuration(sessionDuration)} · {completedExercises}/{exerciseStates.length} DONE
          </p>
        </div>
        <button
          onClick={finishSession}
          disabled={finishing}
          className="border border-white px-4 py-2 text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {finishing ? "SAVING..." : "FINISH"}
        </button>
      </div>

      <div className="space-y-2">
        {workout.workoutExercises.map((we, index) => {
          const state = exerciseStates.find((s) => s.exerciseId === we.exerciseId)
          if (!state) return null
          const completedSets = state.sets.filter((s) => s.completed).length
          const allDone = completedSets === state.sets.length && state.sets.length > 0

          return (
            <div
              key={we.exerciseId}
              className={`border transition-colors ${allDone ? "border-white/60" : "border-white/20"}`}
            >
              <button
                onClick={() => toggleExpand(we.exerciseId)}
                className="w-full p-4 text-left flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">{index + 1}.</span>
                    <span className={`font-bold text-sm ${allDone ? "line-through text-white/40" : ""}`}>
                      {we.exercise.name}
                    </span>
                    {allDone && <span className="text-xs text-white/40">✓</span>}
                  </div>
                  <p className="text-xs text-white/40 ml-5">
                    {completedSets}/{state.sets.length} sets
                    {we.exercise.trackingTypes.length > 0 && (
                      <span className="ml-2">[{we.exercise.trackingTypes.join(", ")}]</span>
                    )}
                  </p>
                </div>
                <span className="text-white/40 text-lg">{state.expanded ? "−" : "+"}</span>
              </button>

              {state.expanded && (
                <div className="border-t border-white/10 p-4 space-y-4">
                  {we.exercise.description && (
                    <p className="text-xs text-white/60">{we.exercise.description}</p>
                  )}
                  {we.exercise.videoLink && (
                    <a
                      href={we.exercise.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs border border-white/20 px-3 py-1 hover:border-white transition-colors"
                    >
                      ▶ VIDEO
                    </a>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs tracking-widest text-white/60">SETS</p>
                      <button
                        onClick={() => addSet(we.exerciseId, we.exercise.trackingTypes)}
                        className="text-xs border border-white/20 px-2 py-1 hover:border-white transition-colors"
                      >
                        + ADD SET
                      </button>
                    </div>
                    {state.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`border p-3 space-y-2 transition-colors ${
                          set.completed ? "border-white/30 bg-white/5" : "border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">SET {setIndex + 1}</span>
                          <button
                            onClick={() => removeSet(we.exerciseId, setIndex)}
                            className="text-xs text-white/20 hover:text-red-400"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {we.exercise.trackingTypes.includes("reps") && (
                            <div className="space-y-1">
                              <label className="text-xs text-white/40">REPS</label>
                              <input
                                type="number"
                                min={0}
                                value={set.reps ?? ""}
                                onChange={(e) =>
                                  updateSet(we.exerciseId, setIndex, {
                                    reps: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full bg-black border border-white/40 text-white px-2 py-2 text-sm text-center focus:border-white"
                              />
                            </div>
                          )}
                          {we.exercise.trackingTypes.includes("weight") && (
                            <div className="space-y-1">
                              <label className="text-xs text-white/40">WEIGHT (kg)</label>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={set.weight ?? ""}
                                onChange={(e) =>
                                  updateSet(we.exerciseId, setIndex, {
                                    weight: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full bg-black border border-white/40 text-white px-2 py-2 text-sm text-center focus:border-white"
                              />
                            </div>
                          )}
                          {we.exercise.trackingTypes.includes("time") && (
                            <div className="space-y-1">
                              <label className="text-xs text-white/40">TIME (s)</label>
                              <input
                                type="number"
                                min={0}
                                value={set.time ?? ""}
                                onChange={(e) =>
                                  updateSet(we.exerciseId, setIndex, {
                                    time: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full bg-black border border-white/40 text-white px-2 py-2 text-sm text-center focus:border-white"
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            toggleSetComplete(we.exerciseId, setIndex)
                            saveExerciseLog(we.exerciseId, exerciseStates)
                          }}
                          className={`w-full py-2 text-xs tracking-widest border transition-colors ${
                            set.completed
                              ? "bg-white text-black border-white"
                              : "border-white/40 hover:border-white"
                          }`}
                        >
                          {set.completed ? "✓ DONE" : "MARK DONE"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <p className="text-xs tracking-widest text-white/60">TIMER</p>
                    <div className="grid grid-cols-4 gap-1">
                      {(["off", "exercise", "break", "emom"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setTimerMode(we.exerciseId, mode)}
                          className={`py-2 text-xs border transition-colors ${
                            state.timerMode === mode
                              ? "bg-white text-black border-white"
                              : "border-white/20 hover:border-white text-white/60"
                          }`}
                        >
                          {mode === "off" ? "OFF" : mode === "exercise" ? "WORK" : mode === "break" ? "REST" : "EMOM"}
                        </button>
                      ))}
                    </div>
                    {state.timerMode !== "off" && (
                      <Timer
                        mode={state.timerMode}
                        emomInterval={state.emomInterval}
                        onEmomIntervalChange={(v) =>
                          setExerciseStates((states) =>
                            states.map((s) =>
                              s.exerciseId === we.exerciseId ? { ...s, emomInterval: v } : s
                            )
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="pt-4">
        <button
          onClick={finishSession}
          disabled={finishing}
          className="w-full border border-white px-4 py-4 text-sm tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {finishing ? "SAVING SESSION..." : "FINISH WORKOUT"}
        </button>
      </div>
    </div>
  )
}
