import type {BPReading, ModalMode} from "../types.ts"
import {type Dispatch, type SetStateAction} from "react"

import DropdownMenu from "./DropdownMenu.tsx"
import DropdownMenuItem from "./DropdownMenuItem.tsx"
import {FaPlusCircle} from "react-icons/fa"

interface AddReadingProps {
  setBPList: Dispatch<SetStateAction<BPReading[]>>
  setSelectedReading: Dispatch<SetStateAction<string>>
  openModal: (mode: ModalMode, reading?: BPReading) => void
}

const AddReading = ({setBPList, setSelectedReading, openModal}:AddReadingProps) => {
  const createReading = (time = new Date()) => {
    const reading: BPReading = {
      id: crypto.randomUUID(),
      sys: Math.floor(Math.random() * (165 - 110 + 1)) + 110,
      dia: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
      time: time,
    }
    return reading
  }

  const addTwoWeeksReading = () => {
    const addedReadings: BPReading[] = []
    for (let i = 0; i < 14; i++) {
      const dt = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
      const newDate = new Date(dt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)))
      addedReadings.push(createReading(newDate))
    }

    setBPList(prev => [...prev, ...addedReadings])
  }

  return (
    <div className="addReadingWrapper">
      <DropdownMenu classExtension="extAddReading" Icon={FaPlusCircle}>
        <DropdownMenuItem onClick={() => openModal('add')} >Add Reading</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedReading('')}>Clear Selection</DropdownMenuItem>
        <DropdownMenuItem onClick={() => addTwoWeeksReading()}>Add 2 random weeks</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setBPList(prev => [...prev, createReading()])}>Add an arbitrary reading</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setBPList([])}>Clear all readings</DropdownMenuItem>
      </DropdownMenu>
    </div>
  )
}

export default AddReading