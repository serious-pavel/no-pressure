import {memo, useCallback, type Dispatch, type SetStateAction} from "react"
import {FaRegEdit, FaRegTrashAlt} from "react-icons/fa"
import type {BPReading, ModalMode} from "../types.ts"
import {getGrade} from "../functions/colorFunctions.ts"

interface ReadingListProps {
  readings: BPReading[]
  selectedReadingId: string
  setSelectedReading: Dispatch<SetStateAction<string>>
  openModal: (mode: ModalMode, reading?: BPReading) => void
}

interface ReadingListItemProps {
  reading: BPReading
  isSelected: boolean
  onSelect: (readingId: string) => void
  onDelete: (reading: BPReading) => void
  onEdit: (reading: BPReading) => void
}

const ReadingListItem = memo(({reading, isSelected, onSelect, onDelete, onEdit}: ReadingListItemProps) => {
  const shortDate = reading.time.toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "2-digit"})
  const shortTime = reading.time.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})

  return (
    <div
      onClick={() => onSelect(reading.id)}
      className={`readingListItem color-${getGrade(reading)} ${isSelected ? "selected" : ""}`}
    >
      <div className="readingListItemData">
        <div className="readingDateWrapper">
          <div className="readingDate">{shortDate}</div>
          <div className="readingTime">{shortTime}</div>
        </div>
        <div className="readingValueWrapper">
          <div className="readingValue">{reading.sys}</div>
          <div className="readingValue">{reading.dia}</div>
        </div>
      </div>
      <div className="readingListItemControl">
        <button
          className="readingListItemControlButton"
          onClick={(event) => {
            event.stopPropagation()
            onSelect(reading.id)
            onDelete(reading)
          }}
        >
          <FaRegTrashAlt/>
        </button>
        <button
          className="readingListItemControlButton"
          onClick={(event) => {
            event.stopPropagation()
            onSelect(reading.id)
            onEdit(reading)
          }}
        >
          <FaRegEdit/>
        </button>
      </div>
    </div>
  )
})

const ReadingList = ({readings, selectedReadingId, setSelectedReading, openModal}: ReadingListProps) => {
  const handleSelect = useCallback((readingId: string) => {
    setSelectedReading(readingId)
  }, [setSelectedReading])

  const handleDelete = useCallback((reading: BPReading) => {
    openModal("delete", reading)
  }, [openModal])

  const handleEdit = useCallback((reading: BPReading) => {
    openModal("edit", reading)
  }, [openModal])

  return (
    <div className="readingListWrapper">
      {readings.map((reading) => (
        <ReadingListItem
          key={reading.id}
          reading={reading}
          isSelected={reading.id === selectedReadingId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </div>
  )
}

export default memo(ReadingList)
