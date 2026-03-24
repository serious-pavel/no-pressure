import {FaPlusCircle} from "react-icons/fa"
import {useState, type ReactNode, useEffect, useRef} from "react"
import {DropdownMenuContext} from "../context/DropdownMenuContext"

interface DropdownMenuProps {
  children: ReactNode
}

const DropdownMenu = ({children}: DropdownMenuProps) => {
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
      <div className="dropdownMenuWrapper" ref={wrapperRef}>
        <button
          type="button"
          className="dropdownMenuButton"
          onClick={() => setOpen(prev => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <FaPlusCircle className={`plusIcon text-unset`}/>
        </button>
        {open && (
          <ul className="dropdownMenu" role="menu">
            {children}
          </ul>
        )}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export default DropdownMenu