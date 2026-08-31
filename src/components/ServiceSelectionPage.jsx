import { useState } from 'react'
import { motion } from 'framer-motion'
import { SERVICES } from '../config/services'
import { downloadServiceTemplate } from '../utils/downloadTemplate'
import TemplateDownloadDialog from './TemplateDownloadDialog'

const DownloadIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ICONS = {
  skynet: (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-sky-600">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  mailamerica: (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-slate-400">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

export default function ServiceSelectionPage({ onSelect, theme = 'light' }) {
  const [downloadTarget, setDownloadTarget] = useState(null) // service object pending confirmation

  const handleConfirmDownload = () => {
    if (downloadTarget) downloadServiceTemplate(downloadTarget.key)
    setDownloadTarget(null)
  }

  return (
    <div className={`tech-page ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="tech-grid" />
      <div className="tech-glow glow-one" />
      <div className="tech-glow glow-two" />
      <div className="tech-glow glow-three" />

      <div className="tech-content mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="tech-hero-title text-3xl sm:text-4xl">
            Welcome to Tracking Data Upload Center
          </h1>
          <p className="tech-hero-subtitle mx-auto mt-3 max-w-xl text-sm">
            Select a logistics service to begin uploading and validating tracking information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.key}
              role="button"
              tabIndex={service.enabled ? 0 : -1}
              aria-disabled={!service.enabled}
              onClick={() => service.enabled && onSelect(service.key)}
              onKeyDown={(e) => {
                if (service.enabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onSelect(service.key)
                }
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={service.enabled ? { y: -4 } : undefined}
              className={[
                'tech-card group relative flex flex-col items-start rounded-2xl border p-6 text-left transition duration-300',
                service.enabled
                  ? 'border-sky-400/30 bg-white/80 shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_20px_60px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:border-sky-300/70 hover:shadow-[0_0_0_1px_rgba(125,211,252,0.2),0_28px_80px_rgba(14,116,144,0.25)] cursor-pointer dark:bg-slate-900/65 dark:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_20px_60px_rgba(15,23,42,0.6)] dark:hover:shadow-[0_0_0_1px_rgba(125,211,252,0.2),0_28px_80px_rgba(14,116,144,0.35)]'
                  : 'border-slate-200 bg-slate-100/90 opacity-60 dark:border-slate-700 dark:bg-slate-800/35',
              ].join(' ')}
            >
              {service.enabled && (
                <button
                  type="button"
                  title={`Download ${service.name} template`}
                  aria-label={`Download ${service.name} template`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDownloadTarget(service)
                  }}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/80 text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-sky-400/60 dark:hover:text-sky-300"
                >
                  {DownloadIcon}
                </button>
              )}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-sky-400/20 bg-slate-50 text-sky-600 shadow-inner shadow-sky-500/10 group-hover:bg-sky-50 group-hover:text-sky-700 dark:border-sky-400/20 dark:bg-slate-950/60 dark:text-sky-300 dark:group-hover:bg-sky-500/10 dark:group-hover:text-sky-200">
                {ICONS[service.key]}
              </div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">{service.name}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{service.description}</p>
              {service.serviceCode && (
                <span className="mt-3 inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200">
                  Service Name : {service.name} (Code : {service.serviceCode})
                </span>
              )}
              {!service.enabled && (
                <span className="mt-3 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-200">
                  Coming soon
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <TemplateDownloadDialog
        open={!!downloadTarget}
        serviceName={downloadTarget?.name}
        onConfirm={handleConfirmDownload}
        onCancel={() => setDownloadTarget(null)}
      />
    </div>
  )
}
