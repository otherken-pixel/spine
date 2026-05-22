import { useState, useCallback } from 'react'

const GOAL_KEY = 'spine_reading_goal_v1'

function load(): number {
  try { return parseInt(localStorage.getItem(GOAL_KEY) ?? '0') || 0 } catch { return 0 }
}

export function useReadingGoal() {
  const [goal, setGoalState] = useState<number>(load)

  const setGoal = useCallback((n: number) => {
    setGoalState(n)
    try { localStorage.setItem(GOAL_KEY, String(n)) } catch {}
  }, [])

  return { goal, setGoal }
}
