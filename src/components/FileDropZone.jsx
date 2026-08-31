import { useRef, useState } from 'react'

export default function FileDropZone({ onFileSelected, accept = '.csv,.xlsx,.xls', fileName, theme = 'light' }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files) => {
    if (files && files[0]) onFileSelected(files[0])
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={[
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
        dragOver
          ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-sky-300',
        theme === 'dark' ? 'shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)]' : '',
      ].join(' ')}
    >
      <svg viewBox="0 0 24 24" fill="none" className="mb-3 h-9 w-9 text-[var(--text-muted)]">
        <path
          d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-sm font-medium text-[var(--text)]">
        {fileName ? fileName : 'Click to select, or drag and drop a file here'}
      </p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Accepted formats: .csv, .xlsx, .xls</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
