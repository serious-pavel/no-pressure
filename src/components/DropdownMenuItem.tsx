import type {ReactNode} from "react"
import {useDropdownMenu} from "../context/DropdownMenuContext"

interface DropdownMenuItemProps {
  onClick?: () => void
  children: ReactNode
}

const DropdownMenuItem = ({onClick, children}: DropdownMenuItemProps) => {

  const {closeMenu} = useDropdownMenu()

  const handleClick = () => {
    onClick?.()
    closeMenu()
  }

  return (
    <li role="none" className="dropdownMenuItem">
      <button type="button" role="menuitem" className="dropdownMenuItemButton" onClick={handleClick}>
        {children}
      </button>
    </li>
  )
}

export default DropdownMenuItem