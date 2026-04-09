import type {BPReading} from "../types.ts"

type WithTime = { time: Date }

export function readingsLastNDays<T extends WithTime>(
  readings: T[],
  days: number,
  now: Date = new Date()
): T[] {
  const startWindow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  startWindow.setDate(startWindow.getDate() - (days - 1)) // e.g. 7 -> start 6 days ago

  return readings
    .filter(reading => reading.time >= startWindow && reading.time <= now)
}


export function getDayOffset(date2: Date) {
  const date = new Date(date2)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = Math.abs(startOfDay.getTime() - startOfToday.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getBucketedReadings(readings: BPReading[]) {
  const bucketedReadings: BPReading[][] = Array.from({length: 7}, () => [])
  readings.map(
    (reading) => bucketedReadings[getDayOffset(reading.time)].push(reading)
  )
  return bucketedReadings
}