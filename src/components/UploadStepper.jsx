const STEPS = ['Upload', 'Validate', 'Review', 'Submit']

export default function UploadStepper({ currentStep }) {
  const activeIndex = STEPS.indexOf(currentStep)

  return (
    <ol className="stepper">
      {STEPS.map((step, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming'
        return (
          <li key={step} className={`stepper-item stepper-item-${state}`}>
            <span className="stepper-dot">{state === 'done' ? '✓' : index + 1}</span>
            <span className="stepper-label">{step}</span>
            {index < STEPS.length - 1 && <span className="stepper-connector" />}
          </li>
        )
      })}
    </ol>
  )
}
