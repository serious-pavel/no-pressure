import {useCallback, useEffect, useRef, type MouseEvent} from "react"

export const useModalWindowFocus = <T extends HTMLElement>() => {
  const modalRef = useRef<T>(null)

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  const handleMouseDown = useCallback((event: MouseEvent<T>) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.focus()
    }
  }, [])

  return {modalRef, handleMouseDown}
}
