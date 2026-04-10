import type {BPReading, ModalMode} from "../types.ts"
import {useEffect, type MouseEvent} from "react"

interface ReadingModalProps {
  mode: ModalMode
  reading: BPReading | null
  onClose: () => void
}


const ReadingModal = ({mode, reading, onClose}: ReadingModalProps) => {
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

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow" role="dialog" aria-modal="true">
        <div>
          {reading && reading.time.toLocaleString() + " " + reading.sys + "/" + reading.dia}
        </div>
        <div>{mode}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default ReadingModal