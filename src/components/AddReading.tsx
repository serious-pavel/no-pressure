import type {BPReading, ModalMode} from "../types.ts"

import DropdownMenu from "./DropdownMenu.tsx"
import DropdownMenuItem from "./DropdownMenuItem.tsx"
import {FaPlusCircle} from "react-icons/fa"

interface AddReadingProps {
  onCreateRandomReading: () => void
  onCreateRandomWeek: () => void
  onClearAll: () => void
  onClearSelection: () => void
  openModal: (mode: ModalMode, reading?: BPReading) => void
}

const AddReading = ({onCreateRandomReading, onCreateRandomWeek, onClearAll, onClearSelection, openModal}:AddReadingProps) => {
  return (
    <div className="addReadingWrapper">
      <DropdownMenu classExtension="extAddReading" Icon={FaPlusCircle}>
        <DropdownMenuItem onClick={() => openModal('add')} >Add Reading</DropdownMenuItem>
        <DropdownMenuItem onClick={onClearSelection}>Clear Selection</DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateRandomWeek}>Add 2 random weeks</DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateRandomReading}>Add an arbitrary reading</DropdownMenuItem>
        <DropdownMenuItem onClick={onClearAll}>Clear all readings</DropdownMenuItem>
      </DropdownMenu>
    </div>
  )
}

export default AddReading
