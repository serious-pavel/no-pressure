import {useCallback, useEffect, type MouseEvent} from "react"

export const useModalDismiss = <T extends HTMLElement>(onClose: () => void) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const handleOverlayClick = useCallback((event: MouseEvent<T>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }, [onClose])

  return {handleOverlayClick}
}
