import type {BPReading} from "../types.ts";
import {type Dispatch, type SetStateAction} from "react";

interface ReadingListProps {
  readings: BPReading[],
  selectedReadingId: string,
  setBPList: Dispatch<SetStateAction<BPReading[]>>
  setSelectedReading: Dispatch<SetStateAction<string>>
}

const ReadingList = ({readings, selectedReadingId, setBPList, setSelectedReading}: ReadingListProps) => {
  const RemoveReading = (readingId: string) => {
    const newReadings = readings.filter((reading) => reading.id !== readingId)
    setBPList(newReadings)
  }

  return (
    <div className="readingListWrapper">
      {readings.map((reading: BPReading) =>
        <div
          onClick={() => {
            setSelectedReading(reading.id)
            console.log("Selected")
          }}
          key={reading.id}
          className={reading.id === selectedReadingId ? 'bpListItem selected' : 'bpListItem'}
        >
          {new Date(reading.time).toLocaleString()}: {reading.sys}/{reading.dia}
          <button onClick={(e) => {
            e.stopPropagation()
            RemoveReading(reading.id)
          }}>X
          </button>
        </div>
      )}
    </div>
  )
}

export default ReadingList