import type {BPReading, ModalMode} from "../types.ts"
import {useEffect, type MouseEvent, type SubmitEvent} from "react"

interface ReadingModalProps {
  mode: Exclude<ModalMode, null>
  selectedReading: BPReading | null
  onClose: () => void
  onDelete: () => void
  onSave: () => void
}

interface modalConfig {
  title: string
  confirmText: string
}


const ReadingModal = ({mode, selectedReading, onClose, onDelete, onSave}: ReadingModalProps) => {
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

    onSave()

  }

  const config = modalConfig[mode]

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow" role="dialog" aria-modal="true">
        <div>{config.title}</div>

        <form onSubmit={handleSubmit} id="readingForm">
          <label htmlFor="sys">Systolic</label>
          <input type="number" id="sys" name="sys" defaultValue={selectedReading?.sys} disabled={mode === 'delete'}/>
          <label htmlFor="dia">Diastolic</label>
          <input type="number" id="dia" name="dia" defaultValue={selectedReading?.dia} disabled={mode === 'delete'}/>
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