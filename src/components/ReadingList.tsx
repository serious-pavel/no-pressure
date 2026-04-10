import type {BPReading, ModalMode} from "../types.ts"
import {type Dispatch, type SetStateAction} from "react"
import {FaRegEdit, FaRegTrashAlt} from "react-icons/fa"
import {getGrade} from "../functions/colorFunctions.ts"

interface ReadingListProps {
  readings: BPReading[]
  selectedReadingId: string
  setBPList: Dispatch<SetStateAction<BPReading[]>>
  setSelectedReading: Dispatch<SetStateAction<string>>
  openModal: (mode: ModalMode, reading?: BPReading) => void
}

const ReadingList = ({readings, selectedReadingId, setBPList, setSelectedReading, openModal}: ReadingListProps) => {
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
          className={`readingListItem color-${getGrade(reading)} ${reading.id === selectedReadingId ? 'selected' : ''}`}
        >
          <div className="readingListItemData">
            <div className="readingDateWrapper">
              <div className="readingDate">
                {getShortDate(reading.time)}
              </div>
              <div className="readingTime">
                {getShortTime(reading.time)}
              </div>
            </div>
            <div className="readingValueWrapper">
              <div className="readingValue">
                {reading.sys}
              </div>
              <div className="readingValue">
                {reading.dia}
              </div>
            </div>
          </div>
          <div className="readingListItemControl">
            <button
              className="readingListItemControlButton"
              onClick={(e) => {
                e.stopPropagation()
                openModal('delete', reading)
              }}>
              <FaRegTrashAlt/>
            </button>
            <button
              className="readingListItemControlButton"
              onClick={(e) => {
                e.stopPropagation()
                openModal('edit', reading)
              }}>
              <FaRegEdit/>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingList