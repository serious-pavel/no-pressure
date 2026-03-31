import type {BPReading, TimeRangeMode, TimeRangeScale, TimeWindow, VisibleRangeResult} from "../types.ts"

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfWeek(date: Date) {
  const d = startOfDay(date)
  const day = d.getDay() // 0 = Sunday, 1 = Monday, ...
  return addDays(d, -day)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1)
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function addYears(date: Date, years: number) {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

function getWindowBounds(
  scale: TimeRangeScale,
  mode: TimeRangeMode,
  offset: number,
  now = new Date(),
): TimeWindow {
  const anchor = new Date(now)
  let start: Date

  if (scale === "week") {
    if (mode === "calendar") {
      start = addDays(startOfWeek(anchor), offset * 7)
    } else {
      start = addDays(startOfDay(anchor), -6 + offset * 7)
    }
    return {start, end: addDays(start, 7)}
  }

  if (scale === "month") {
    if (mode === "calendar") {
      start = addMonths(startOfMonth(anchor), offset)
    } else {
      start = addDays(startOfDay(anchor), -29 + offset * 30)
    }
    return {start, end: addMonths(start, 1)}
  }

  if (mode === "calendar") {
    start = addYears(startOfYear(anchor), offset)
  } else {
    start = addDays(startOfDay(anchor), -364 + offset * 365)
  }
  return {start, end: addYears(start, 1)}
}

export function getVisibleReadings(
  readings: BPReading[],
  scale: TimeRangeScale,
  mode: TimeRangeMode,
  offset: number,
): VisibleRangeResult {
  const timeWindow = getWindowBounds(scale, mode, offset)
  const visibleReadings = readings.filter(reading => reading.time >= timeWindow.start && reading.time <= timeWindow.end)
  return {visibleReadings, timeWindow}
}