import type {BPReading, ModalMode} from "../types.ts"
import {useEffect, type MouseEvent, type SubmitEvent, useState, type ChangeEvent} from "react"

interface ReadingModalProps {
  mode: Exclude<ModalMode, null>
  selectedReading: BPReading | null
  onClose: () => void
  onDelete: () => void
  onSave: (reading: BPReading) => void
}

interface modalConfig {
  title: string
  confirmText: string
}

interface ReadingFormState {
  sys: string
  dia: string
  time: string
}

const getInitialFormData = (mode: Exclude<ModalMode, null>, selectedReading: BPReading | null) => {
  if (mode === 'add') {
    return {
      sys: "120",
      dia: "80",
      time: new Date().toISOString().slice(0, 16),
    }
  }

  return {
    sys: selectedReading?.sys.toString() ?? "",
    dia: selectedReading?.dia.toString() ?? "",
    time: selectedReading?.time.toISOString().slice(0, 16) || "",
  }
}

const ReadingModal = ({mode, selectedReading, onClose, onDelete, onSave}: ReadingModalProps) => {

  const [formData, setFormData] = useState<ReadingFormState>(
    () => getInitialFormData(mode, selectedReading)
  )
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    setFormData(getInitialFormData(mode, selectedReading))
  }, [mode, selectedReading]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

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

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'delete') {
      if (selectedReading) {
        onDelete()
        return
      }
    }

    if (!selectedReading && mode === 'edit') return
    if (!formData.sys || !formData.dia || !formData.time) {
      setModalError("Please fill in all fields")
      return
    }

    const readingToSave: BPReading = {
      id: mode === 'edit' ? selectedReading?.id || crypto.randomUUID() : crypto.randomUUID(),
      sys: Number(formData.sys),
      dia: Number(formData.dia),
      time: new Date(formData.time),
    }

    onSave(readingToSave)

  }

  const config = modalConfig[mode]

  const getInputClass = (value: string) => {
    return !value ? "inputError" : ""
  }

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow" role="dialog" aria-modal="true">
        <div>{config.title}</div>

        <form onSubmit={handleSubmit} id="readingForm">
          <div>
            <label>
              Sys
              <input
                className={getInputClass(formData.sys)}
                name="sys"
                type="number"
                value={formData.sys}
                onChange={handleChange}
                disabled={mode === 'delete'}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Dia
              <input
                className={getInputClass(formData.dia)}
                name="dia"
                type="number"
                value={formData.dia}
                onChange={handleChange}
                disabled={mode === 'delete'}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Time
              <input
                className={getInputClass(formData.time)}
                name="time"
                type="datetime-local"
                value={formData.time}
                onChange={handleChange}
                disabled={mode === 'delete'}
                required
              />
            </label>
          </div>
          {modalError && <div className="modalError">{modalError}</div>}
        </form>

        <div className="modalWindowControls">
          <button onClick={onClose}>Close</button>
          <button type="submit" form="readingForm">{config.confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export default ReadingModal