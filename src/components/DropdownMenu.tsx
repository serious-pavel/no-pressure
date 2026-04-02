import {useState, type ReactNode, useEffect, useRef} from "react"
import {DropdownMenuContext} from "../context/DropdownMenuContext"
import type {IconType} from "react-icons";

interface DropdownMenuProps {
  children: ReactNode
  classExtension: string
  Icon: IconType
}

const DropdownMenu = ({children, classExtension, Icon}: DropdownMenuProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const wrapperRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <DropdownMenuContext.Provider value={{closeMenu: () => setOpen(false)}}>
      <div className={`dropdownMenuWrapper ${classExtension}`} ref={wrapperRef}>
        <button
          type="button"
          className={`dropdownMenuButton ${classExtension}`}
          onClick={() => setOpen(prev => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <Icon className={`dropdownMenuIcon ${classExtension} text-unset`}/>
        </button>
        {open && (
          <ul className={`dropdownMenu ${classExtension}`} role="menu">
            {children}
          </ul>
        )}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export default DropdownMenu