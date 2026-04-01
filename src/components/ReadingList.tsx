import type {BPReading} from "../types.ts";
import {type Dispatch, type SetStateAction} from "react";

interface ReadingListProps {
  readings: BPReading[],
  selectedReadingId: string,
  setBPList: Dispatch<SetStateAction<BPReading[]>>
  setSelectedReading: Dispatch<SetStateAction<string>>
}

const ReadingList = ({readings, selectedReadingId, setBPList, setSelectedReading}: ReadingListProps) => {
  const removeReading = (readingId: string) => {
    const newReadings = readings.filter((reading) => reading.id !== readingId)
    setBPList(newReadings)
  }

  const getShortDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "2-digit"})
  }

  const getShortTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})
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
          className={`bpListItem ${reading.id === selectedReadingId ? 'selected' : ''}`}
        >
          {getShortDate(reading.time)} {getShortTime(reading.time)}: {reading.sys}/{reading.dia}
          <button onClick={(e) => {
            e.stopPropagation()
            removeReading(reading.id)
          }}>X
          </button>
        </div>
      )}
    </div>
  )
}

export default ReadingList