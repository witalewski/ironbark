"use client"
import { useState, useEffect, useRef, useCallback } from "react"

interface TimerProps {
  mode: "exercise" | "break" | "emom"
  emomInterval: number
  onEmomIntervalChange: (v: number) => void
}

export default function Timer({ mode, emomInterval, onEmomIntervalChange }: TimerProps) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [countdown, setCountdown] = useState(emomInterval)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedElapsedRef = useRef<number>(0)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setElapsed(0)
    pausedElapsedRef.current = 0
    if (mode === "emom") setCountdown(emomInterval)
  }, [stop, mode, emomInterval])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    reset() // eslint-disable-line react-hooks/set-state-in-effect
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    if (running) return
    startTimeRef.current = Date.now() - pausedElapsedRef.current * 1000
    intervalRef.current = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsed(newElapsed)
      pausedElapsedRef.current = newElapsed
      if (mode === "emom") {
        const remaining = emomInterval - (newElapsed % emomInterval)
        setCountdown(remaining === 0 ? emomInterval : remaining)
      }
    }, 100)
    setRunning(true)
  }

  function pause() {
    stop()
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="border border-white/20 p-4 space-y-3">
      <div className="text-center">
        {mode === "emom" ? (
          <div className="space-y-1">
            <p className="text-4xl font-bold tracking-widest">{formatTime(countdown)}</p>
            <p className="text-xs text-white/40">UNTIL NEXT MINUTE</p>
            <p className="text-xs text-white/40">TOTAL: {formatTime(elapsed)}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-4xl font-bold tracking-widest">{formatTime(elapsed)}</p>
            <p className="text-xs text-white/40">
              {mode === "exercise" ? "WORK TIME" : "REST TIME"}
            </p>
          </div>
        )}
      </div>

      {mode === "emom" && !running && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/60">INTERVAL (s)</label>
          <input
            type="number"
            min={10}
            value={emomInterval}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 60
              onEmomIntervalChange(v)
              setCountdown(v)
            }}
            className="w-20 bg-black border border-white/40 text-white px-2 py-1 text-sm text-center focus:border-white"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={running ? pause : start}
          className="py-2 text-xs tracking-widest border border-white hover:bg-white hover:text-black transition-colors"
        >
          {running ? "PAUSE" : "START"}
        </button>
        <button
          onClick={reset}
          className="py-2 text-xs tracking-widest border border-white/20 hover:border-white transition-colors"
        >
          RESET
        </button>
        <div />
      </div>
    </div>
  )
}
