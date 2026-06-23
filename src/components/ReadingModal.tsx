import type {BPReading, ModalMode} from "../types.ts"
import {type ChangeEvent, type SubmitEvent, useEffect, useRef, useState} from "react"
import ModalWindow from "./ModalWindow.tsx"
import {FaRegCalendar, FaRegClock} from "react-icons/fa"
import ReadingWheelPicker from "./ReadingWheelPicker.tsx"
import {
  diastolicValues,
  formatDateButtonValue,
  formatTimeButtonValue,
  getInitialFormData,
  systolicValues,
  type ReadingFormState,
} from "../functions/readingModal.ts"

interface ReadingModalProps {
  mode: Exclude<ModalMode, null>
  selectedReading: BPReading | null
  onClose: () => void
  onDelete: () => Promise<void> | void
  onSave: (reading: BPReading) => Promise<void> | void
}

interface ModalConfig {
  title: string
  confirmText: string
}

const ReadingModal = ({mode, selectedReading, onClose, onDelete, onSave}: ReadingModalProps) => {
  const [formData, setFormData] = useState<ReadingFormState>(() => getInitialFormData(mode, selectedReading))
  const [modalError, setModalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFormData(getInitialFormData(mode, selectedReading))
    setModalError(null)
  }, [mode, selectedReading])

  const modalConfig: Record<Exclude<ModalMode, null>, ModalConfig> = {
    edit: {
      title: "Edit the reading",
      confirmText: "Save",
    },
    add: {
      title: "Add new reading",
      confirmText: "Add",
    },
    delete: {
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

  const openNativePicker = (input: HTMLInputElement | null) => {
    const nativeInput = input as (HTMLInputElement & { showPicker?: () => void }) | null
    if (nativeInput?.showPicker) {
      nativeInput.showPicker()
      return
    }

    nativeInput?.click()
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setModalError(null)
    setIsSubmitting(true)

    try {
      if (mode === "delete") {
        if (selectedReading) {
          await onDelete()
          return
        }
      }

      if (!selectedReading && mode === "edit") return
      if (!formData.sys || !formData.dia || !formData.dtDate || !formData.dtTime) {
        setModalError("Please fill in all fields")
        return
      }

      const readingToSave: BPReading = {
        id: mode === "edit" ? selectedReading?.id || crypto.randomUUID() : crypto.randomUUID(),
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
    <ModalWindow onClose={onClose}>
      <div className="modalWindowTitle">{config.title}</div>
      <div className="modalWindowContent">
        <form onSubmit={handleSubmit} id="readingForm">
          <div className="readingWheelRow">
            <ReadingWheelPicker
              label="Systolic"
              value={formData.sys}
              values={systolicValues}
              disabled={mode === "delete"}
              onChange={(value) => setFormData(prev => ({...prev, sys: value}))}
            />
            <div className="readingWheelRowDivider">/</div>
            <ReadingWheelPicker
              label="Diastolic"
              value={formData.dia}
              values={diastolicValues}
              disabled={mode === "delete"}
              onChange={(value) => setFormData(prev => ({...prev, dia: value}))}
            />
          </div>

          <div className="readingDateRow">
            <label htmlFor="dtDate">Date</label>
            <div className="readingDateControlRow">
              <input
                ref={dateInputRef}
                className={`readingDateNativeInput ${getInputClass(formData.dtDate)}`}
                name="dtDate"
                id="dtDate"
                type="date"
                value={formData.dtDate}
                onChange={handleChange}
                disabled={mode === "delete"}
                tabIndex={-1}
                aria-hidden="true"
                required
              />
              <button
                type="button"
                className={`readingDateControlButton ${getInputClass(formData.dtDate)}`}
                onClick={() => openNativePicker(dateInputRef.current)}
                disabled={mode === "delete"}
                aria-label={`Open date picker, current value ${formatDateButtonValue(formData.dtDate)}`}
                title="Open date picker"
              >
                <FaRegCalendar aria-hidden="true" />
                <span>{formatDateButtonValue(formData.dtDate)}</span>
              </button>
            </div>

            <label htmlFor="dtTime">Time</label>
            <div className="readingDateControlRow">
              <input
                ref={timeInputRef}
                className={`readingDateNativeInput ${getInputClass(formData.dtTime)}`}
                name="dtTime"
                id="dtTime"
                type="time"
                value={formData.dtTime}
                onChange={handleChange}
                disabled={mode === "delete"}
                tabIndex={-1}
                aria-hidden="true"
                required
              />
              <button
                type="button"
                className={`readingDateControlButton ${getInputClass(formData.dtTime)}`}
                onClick={() => openNativePicker(timeInputRef.current)}
                disabled={mode === "delete"}
                aria-label={`Open time picker, current value ${formatTimeButtonValue(formData.dtTime)}`}
                title="Open time picker"
              >
                <FaRegClock aria-hidden="true" />
                <span>{formatTimeButtonValue(formData.dtTime)}</span>
              </button>
            </div>
          </div>

          {modalError && <div className="modalError">{modalError}</div>}
        </form>
      </div>

      <div className="modalWindowControls">
        <button onClick={onClose} disabled={isSubmitting}>Close</button>
        <button type="submit" form="readingForm" disabled={isSubmitting}>{config.confirmText}</button>
      </div>
    </ModalWindow>
  )
}

export default ReadingModal
