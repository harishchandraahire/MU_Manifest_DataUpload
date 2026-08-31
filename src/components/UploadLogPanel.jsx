import { useState } from 'react'
import UploadLogList from './UploadLogList'
import { downloadUploadLog } from '../utils/downloadUploadLog'

export default function UploadLogPanel({ entries, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="upload-log-panel">
      <div className="upload-log-panel-header">
        <button type="button" className="btn-secondary btn-sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : 'View'} upload log ({entries.length} chunk{entries.length === 1 ? '' : 's'})
        </button>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => downloadUploadLog(entries)}
          disabled={!entries.length}
        >
          Download Log
        </button>
      </div>
      {open && (
        <div className="upload-log-panel-body">
          <UploadLogList entries={entries} maxHeight={280} />
        </div>
      )}
    </div>
  )
}
