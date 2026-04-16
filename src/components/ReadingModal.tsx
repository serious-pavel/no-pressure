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


const ReadingModal = ({mode, selectedReading, onClose, onDelete, onSave}: ReadingModalProps) => {

  const [formData, setFormData] = useState<ReadingFormState>({
    sys: mode === 'add' ? "120" : selectedReading?.sys.toString() || "",
    dia: mode === 'add' ? "80" : selectedReading?.dia.toString() || "",
    time: mode === 'add' ? new Date().toISOString().slice(0, 16) : selectedReading?.time.toISOString().slice(0, 16) || ""
  })

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
      console.log("Delete")
      if (selectedReading) {
        console.log("Delete reading", selectedReading.id)
        onDelete()
        return
      }
    }

    if (!selectedReading && mode === 'edit') return

    const readingToSave: BPReading = {
      id: mode === 'edit' ? selectedReading?.id || crypto.randomUUID() : crypto.randomUUID(),
      sys: Number(formData.sys),
      dia: Number(formData.dia),
      time: new Date(formData.time),
    }

    onSave(readingToSave)

  }

  const config = modalConfig[mode]

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow" role="dialog" aria-modal="true">
        <div>{config.title}</div>

        <form onSubmit={handleSubmit} id="readingForm">
          <div>
            <label>
              Sys
              <input
                name="sys"
                type="number"
                value={formData.sys}
                onChange={handleChange}
              />
            </label>
          </div>

          <div>
            <label>
              Dia
              <input
                name="dia"
                type="number"
                value={formData.dia}
                onChange={handleChange}
              />
            </label>
          </div>

          <div>
            <label>
              Time
              <input
                name="time"
                type="datetime-local"
                value={formData.time}
                onChange={handleChange}
              />
            </label>
          </div>
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