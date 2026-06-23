import type {BPReading, ModalMode} from "../types.ts"
import {getLocalDateInputValue, getLocalTimeInputValue} from "./dateTime.ts"

export interface ReadingFormState {
  sys: string
  dia: string
  dtDate: string
  dtTime: string
}

export const systolicValues = Array.from({length: 171}, (_, index) => index + 70)
export const diastolicValues = Array.from({length: 101}, (_, index) => index + 40)

export const formatDateButtonValue = (value: string) => {
  if (!value) return "Select date"

  const [year, month, day] = value.split("-").map(Number)
  if ([year, month, day].some(Number.isNaN)) return value

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const formatTimeButtonValue = (value: string) => {
  if (!value) return "Select time"

  const [hours, minutes] = value.split(":").map(Number)
  if ([hours, minutes].some(Number.isNaN)) return value

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getInitialFormData = (mode: Exclude<ModalMode, null>, selectedReading: BPReading | null) => {
  const now = new Date()

  if (mode === "add") {
    return {
      sys: "120",
      dia: "80",
      dtDate: getLocalDateInputValue(now),
      dtTime: getLocalTimeInputValue(now),
    }
  }

  return {
    sys: selectedReading?.sys.toString() ?? "",
    dia: selectedReading?.dia.toString() ?? "",
    dtDate: selectedReading ? getLocalDateInputValue(selectedReading.time) : "",
    dtTime: selectedReading ? getLocalTimeInputValue(selectedReading.time) : "",
  }
}
