import type {BPReading, ModalMode} from "../types.ts"

import {FaPlusCircle} from "react-icons/fa"

interface AddReadingProps {

  openModal: (mode: ModalMode, reading?: BPReading) => void
}

const AddReading = ({ openModal}:AddReadingProps) => {
  return (
    <div className="addReadingWrapper">
      <button type="button" className="addReadingButton" role="button" onClick={() => openModal('add')} aria-label="Add Reading">
        <FaPlusCircle className="addReadingIcon"/>
      </button>
    </div>
  )
}

export default AddReading
