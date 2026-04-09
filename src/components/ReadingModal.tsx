import type {BPReading, ModalMode} from "../types.ts";

interface ReadingModalProps {
  mode: ModalMode
  reading: BPReading | null
  onClose: () => void
}

const ReadingModal = ({mode, reading, onClose}: ReadingModalProps) => {
  return (
    <div onClick={onClose} className="modalWindowOverlay">
      <div onClick={(e) => e.stopPropagation()} className="modalWindow">
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