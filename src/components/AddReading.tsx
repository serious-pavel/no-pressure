import type {BPReading, ModalMode} from "../types.ts"

import DropdownMenu from "./DropdownMenu.tsx"
import DropdownMenuItem from "./DropdownMenuItem.tsx"
import {FaPlusCircle} from "react-icons/fa"

interface AddReadingProps {

  openModal: (mode: ModalMode, reading?: BPReading) => void
}

const AddReading = ({ openModal}:AddReadingProps) => {
  return (
    <div className="addReadingWrapper">
      <DropdownMenu classExtension="extAddReading" Icon={FaPlusCircle}>
        <DropdownMenuItem onClick={() => openModal('add')} >Add Reading</DropdownMenuItem>

      </DropdownMenu>
    </div>
  )
}

export default AddReading
