import {createContext, useContext} from "react"


interface DropdownMenuContextValue {
  closeMenu: () => void
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

export const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('useDropDown must be used within a DropDownProvider')
  }
  return context
}