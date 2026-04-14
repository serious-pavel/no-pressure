import type {BPReading, ModalMode} from "../types.ts"
import {useEffect, type MouseEvent} from "react"

interface ReadingModalProps {
  mode: Exclude<ModalMode, null>
  reading: BPReading | null
  onClose: () => void
  onDelete: () => void
  onSave: (reading: BPReading) => void
}

interface modalConfig {
  title: string
  confirmText: string
  confirmAction: () => void
}


const ReadingModal = ({mode, reading, onClose, onDelete}: ReadingModalProps) => {
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
      confirmAction: () => {
      }
    },
    'add': {
      title: "Add new reading",
      confirmText: "Add",
      confirmAction: () => {
      }
    },
    'delete': {
      title: "Delete this reading",
      confirmText: "Delete",
      confirmAction: onDelete
    },
  }

  const config = modalConfig[mode]

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow" role="dialog" aria-modal="true">

        <div>{config.title}</div>
        <div>
          {reading && reading.time.toLocaleString() + " " + reading.sys + "/" + reading.dia}
        </div>

        <div className="modalWindowControls">
          <button onClick={onClose}>Close</button>
          <button onClick={config.confirmAction}>{config.confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export default ReadingModal