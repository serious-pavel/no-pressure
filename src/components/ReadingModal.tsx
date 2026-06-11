import type {BPReading, ModalMode} from "../types.ts"
import {type ChangeEvent, type SubmitEvent, useEffect, useMemo, useRef, useState} from "react"
import {getLocalDateInputValue, getLocalTimeInputValue} from "../functions/dateTime.ts"
import {useModalDismiss} from "../hooks/useModalDismiss.ts"

interface ReadingModalProps {
  mode: Exclude<ModalMode, null>
  selectedReading: BPReading | null
  onClose: () => void
  onDelete: () => Promise<void> | void
  onSave: (reading: BPReading) => Promise<void> | void
}

interface modalConfig {
  title: string
  confirmText: string
}

interface ReadingFormState {
  sys: string
  dia: string
  dtDate: string
  dtTime: string
}

interface WheelNumberPickerProps {
  label: string
  value: string
  values: number[]
  disabled: boolean
  onChange: (value: string) => void
}

const WheelNumberPicker = ({label, value, values, disabled, onChange}: WheelNumberPickerProps) => {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectedIndex = useMemo(() => {
    const index = values.findIndex(option => option.toString() === value)
    return index >= 0 ? index : 0
  }, [value, values])

  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex]
    selectedItem?.scrollIntoView({block: "center", inline: "nearest"})
  }, [selectedIndex])

  const handleScroll = () => {
    if (disabled) return

    const container = listRef.current
    if (!container) return

    const containerCenter = container.scrollTop + container.clientHeight / 2
    let closestIndex = selectedIndex
    let smallestDistance = Number.POSITIVE_INFINITY

    itemRefs.current.forEach((item, index) => {
      if (!item) return
      const itemCenter = item.offsetTop + item.offsetHeight / 2
      const distance = Math.abs(itemCenter - containerCenter)

      if (distance < smallestDistance) {
        smallestDistance = distance
        closestIndex = index
      }
    })

    const nextValue = values[closestIndex]?.toString()
    if (nextValue && nextValue !== value) {
      onChange(nextValue)
    }
  }

  return (
    <div className="wheelPickerField" role="group" aria-label={label}>
      <div className="wheelPickerShadow" />
      <span className="wheelPickerLabelText">{label}</span>
      <div
        ref={listRef}
        className={`wheelPicker${disabled ? " disabled" : ""}`}
        onScroll={handleScroll}
        aria-label={label}
        aria-disabled={disabled}
      >
        <div className="wheelPickerSpacer" aria-hidden="true" />
        {values.map((option, index) => {
          const optionText = option.toString()
          const isActive = optionText === value

          return (
            <button
              key={option}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              type="button"
              className={`wheelPickerItem${isActive ? " active" : ""}`}
              onClick={() => !disabled && onChange(optionText)}
              disabled={disabled}
            >
              {optionText}
            </button>
          )
        })}
        <div className="wheelPickerSpacer" aria-hidden="true" />
      </div>
    </div>
  )
}

const systolicValues = Array.from({length: 171}, (_, index) => index + 70)
const diastolicValues = Array.from({length: 101}, (_, index) => index + 40)

const getInitialFormData = (mode: Exclude<ModalMode, null>, selectedReading: BPReading | null) => {
  const now = new Date()

  if (mode === 'add') {
    return {
      sys: "120",
      dia: "80",
      dtDate: getLocalDateInputValue(now),
      dtTime: getLocalTimeInputValue(now),
    }
  }

  return {
    sys: selectedReading?.sys.toString() ?? "",
    dia: selectedReading?.dia.toString() ?? "",
    dtDate: selectedReading ? getLocalDateInputValue(selectedReading.time) : "",
    dtTime: selectedReading ? getLocalTimeInputValue(selectedReading.time) : "",
  }
}

const ReadingModal = ({mode, selectedReading, onClose, onDelete, onSave}: ReadingModalProps) => {
  const [formData, setFormData] = useState<ReadingFormState>(
    () => getInitialFormData(mode, selectedReading)
  )
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {handleOverlayClick} = useModalDismiss<HTMLDivElement>(onClose)

  useEffect(() => {
    setFormData(getInitialFormData(mode, selectedReading))
    setModalError(null)
  }, [mode, selectedReading])

  const modalConfig: Record<Exclude<ModalMode, null>, modalConfig> = {
    'edit': {
      title: "Edit the reading",
      confirmText: "Save",
    },
    'add': {
      title: "Add new reading",
      confirmText: "Add",
    },
    'delete': {
      title: "Delete this reading",
      confirmText: "Delete",
    },
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'delete') {
        if (selectedReading) {
          await onDelete()
          return
        }
      }

      if (!selectedReading && mode === 'edit') return
      if (!formData.sys || !formData.dia || !formData.dtDate || !formData.dtTime) {
        setModalError("Please fill in all fields")
        return
      }

      const readingToSave: BPReading = {
        id: mode === 'edit' ? selectedReading?.id || crypto.randomUUID() : crypto.randomUUID(),
        sys: Number(formData.sys),
        dia: Number(formData.dia),
        time: new Date(`${formData.dtDate}T${formData.dtTime}`),
      }

      await onSave(readingToSave)
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const config = modalConfig[mode]

  const getInputClass = (value: string) => {
    return !value ? "inputError" : ""
  }

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow" role="dialog" aria-modal="true">
        <div className="modalWindowContent">
          <div className="modalWindowTitle">{config.title}</div>

          <form onSubmit={handleSubmit} id="readingForm">
            <div className="readingWheelRow">
              <WheelNumberPicker
                label="Systolic"
                value={formData.sys}
                values={systolicValues}
                disabled={mode === 'delete'}
                onChange={(value) => setFormData(prev => ({...prev, sys: value}))}
              />
              <div className="readingWheelRowDivider">/</div>
              <WheelNumberPicker
                label="Diastolic"
                value={formData.dia}
                values={diastolicValues}
                disabled={mode === 'delete'}
                onChange={(value) => setFormData(prev => ({...prev, dia: value}))}
              />
            </div>

            <div className="readingDateRow">
              <label>
                Date
                <input
                  className={getInputClass(formData.dtDate)}
                  name="dtDate"
                  type="date"
                  value={formData.dtDate}
                  onChange={handleChange}
                  disabled={mode === 'delete'}
                  required
                />
              </label>

              <label>
                Time
                <input
                  className={getInputClass(formData.dtTime)}
                  name="dtTime"
                  type="time"
                  value={formData.dtTime}
                  onChange={handleChange}
                  disabled={mode === 'delete'}
                  required
                />
              </label>
            </div>

            {modalError && <div className="modalError">{modalError}</div>}
          </form>
        </div>

        <div className="modalWindowControls">
          <button onClick={onClose} disabled={isSubmitting}>Close</button>
          <button type="submit" form="readingForm" disabled={isSubmitting}>{config.confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export default ReadingModal
