import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(target, durationMs = 600) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    function tick(now) {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [target, durationMs])

  return value
}

function StatCard({ label, value, tone, suffix = '', icon }) {
  const count = useCountUp(value)
  const tones = {
    slate: 'stat-card-slate',
    emerald: 'stat-card-emerald',
    red: 'stat-card-red',
    sky: 'stat-card-sky',
  }

  return (
    <motion.div
      className={`stat-card ${tones[tone]}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="stat-card-icon">{icon}</div>
      <div>
        <p className="stat-card-value">
          {count}
          {suffix}
        </p>
        <p className="stat-card-label">{label}</p>
      </div>
    </motion.div>
  )
}

export default function ValidationSummary({ total, valid, invalid, onInvalidClick }) {
  const successRate = total > 0 ? Math.round((valid / total) * 100) : 0

  return (
    <div className="stat-card-grid">
      <StatCard label="Total records" value={total} tone="slate" icon="📄" />
      <StatCard label="Valid records" value={valid} tone="emerald" icon="✅" />
      <button
        type="button"
        onClick={onInvalidClick}
        disabled={invalid === 0}
        className="stat-card-button"
        aria-label="View invalid records"
      >
        <StatCard label="Invalid records" value={invalid} tone="red" icon="⚠️" />
      </button>
      <StatCard label="Success rate" value={successRate} suffix="%" tone="sky" icon="📈" />
    </div>
  )
}
