import {type MouseEvent, type ReactNode, useCallback, useEffect, useRef} from "react"

interface ModalWindowProps {
  children: ReactNode
  className?: string
  onClose: () => void
}

const ModalWindow = ({children, className = "", onClose}: ModalWindowProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleOverlayClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.focus()
    }
  }, [])

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div
        ref={modalRef}
        className={`modalWindow${className ? ` ${className}` : ""}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>
    </div>
  )
}

export default ModalWindow
