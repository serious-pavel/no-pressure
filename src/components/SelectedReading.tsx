import type {BPReading} from "../types.ts";
// import type {Dispatch, SetStateAction} from "react";

interface SelectedReadingProps {
  selectedReadingId: string
  readings: BPReading[]
  // setBPList: Dispatch<SetStateAction<BPReading[]>>
}

const SelectedReading = ({selectedReadingId, readings}: SelectedReadingProps) => {
  // if (!selectedReadingId) return <h3>No reading yet</h3>
  //
  const selectedReading = readings.find((reading) => reading.id === selectedReadingId)
  if (!selectedReading) return <h3>No reading yet</h3>
  const {sys, dia, time} = selectedReading
  return (
    <h3>
      Selected:
      {sys} / {dia} - {new Date(time).toLocaleString()}
    </h3>
  )
}

export default SelectedReading

// export default SelectedReading