import type {ReactNode} from "react"
import ModalWindow from "./ModalWindow.tsx"

interface ConfirmationModalProps {
  title: string
  body: ReactNode
  important?: boolean
  confirmText: string
  cancelText?: string
  isConfirming?: boolean
  errorMessage?: string | null
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

const GenericModal = ({
  title,
  body,
  important,
  confirmText,
  cancelText = "Cancel",
  isConfirming = false,
  errorMessage = null,
  onClose,
  onConfirm,
}: ConfirmationModalProps) => {
  const handleClose = () => {
    if (!isConfirming) {
      onClose()
    }
  }

  const handleConfirm = () => {
    void onConfirm()
  }

  return (
    <ModalWindow onClose={handleClose}>
      <div className="modalWindowTitle">{title}</div>
      <div className="modalWindowContent">
        {body}
        {errorMessage && <div className="modalError">{errorMessage}</div>}
      </div>
      <div className="modalWindowControls">
        <button type="button" onClick={handleClose} disabled={isConfirming}>
          {cancelText}
        </button>
        <button type="button" onClick={handleConfirm} disabled={isConfirming} className={important ? "importantButton" : ""}>
          {isConfirming ? "Working..." : confirmText}
        </button>
      </div>
    </ModalWindow>
  )
}

export default GenericModal
