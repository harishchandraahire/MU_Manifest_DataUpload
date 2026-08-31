import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STAGES = [
  'Connecting to Mauritius Post Tracking Network',
  'Initializing Services',
  'Preparing Data Flow',
  'Ready',
]

const STAGE_DURATION_MS = 420

const NODES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: `${10 + ((i * 37) % 80)}%`,
  left: `${5 + ((i * 53) % 90)}%`,
  delay: (i % 5) * 0.3,
}))

export default function LoadingScreen({ onComplete }) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) {
      const doneTimer = setTimeout(() => onComplete?.(), STAGE_DURATION_MS)
      return () => clearTimeout(doneTimer)
    }
    const timer = setTimeout(() => setStageIndex((i) => i + 1), STAGE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [stageIndex, onComplete])

  const progress = ((stageIndex + 1) / STAGES.length) * 100

  return (
    <div className="loading-screen">
      <div className="loading-grid" />
      {NODES.map((node) => (
        <motion.span
          key={node.id}
          className="loading-node"
          style={{ top: node.top, left: node.left }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.6, 1.15, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: node.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="loading-content">
        <div className="loading-progress-track">
          <motion.div
            className="loading-progress-bar"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            className="loading-stage-text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {STAGES[stageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
