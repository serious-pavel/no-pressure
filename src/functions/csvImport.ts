import type {BPReading} from "../types.ts"

export type CsvImportStatus = "ready" | "duplicate" | "conflict" | "invalid"

export interface CsvImportRowPreview {
  lineNumber: number
  status: CsvImportStatus
  message: string
  reading: BPReading | null
}

export interface CsvImportResult {
  delimiter: string
  totalRows: number
  importableRows: BPReading[]
  duplicateRows: number
  conflictRows: number
  invalidRows: number
  previewRows: CsvImportRowPreview[]
}

const expectedHeaders = ["datetime", "systolic", "diastolic", "comment"]

const splitCsvLine = (line: string, delimiter: string) => {
  const values: string[] = []
  let current = ""
  let insideQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]

    if (char === "\"") {
      if (insideQuotes && line[index + 1] === "\"") {
        current += "\""
        index++
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

const splitCsvText = (text: string) => text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")

const parseNumber = (value: string | undefined) => {
  if (!value) return null
  const normalized = value.trim().replace(",", ".")
  if (!normalized) return null

  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const parseInteger = (value: string | undefined) => {
  const number = parseNumber(value)
  if (number === null) return null
  return Math.trunc(number)
}

const parseDateTime = (value: string | undefined) => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const isoWithOffsetMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?([+-]\d{2}:\d{2})$/
  )

  if (!isoWithOffsetMatch) {
    return null
  }

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const readingKey = (reading: Pick<BPReading, "sys" | "dia" | "time">) =>
  `${Math.floor(reading.time.getTime() / 60000)}:${reading.sys}:${reading.dia}`

const timeOnlyKey = (time: Date) => Math.floor(time.getTime() / 60000)

export const parseBloodPressureCsv = (text: string, existingReadings: BPReading[]): CsvImportResult => {
  const lines = splitCsvText(text)
  const rows = lines
    .map(line => line.trimEnd())
    .filter(line => line.trim().length > 0)
    .map(line => splitCsvLine(line, ","))

  const existingKeys = new Set(existingReadings.map(readingKey))
  const existingTimes = new Set(existingReadings.map(reading => timeOnlyKey(reading.time)))
  const seenKeys = new Set<string>()
  const seenTimes = new Set<number>()
  const importableRows: BPReading[] = []
  const previewRows: CsvImportRowPreview[] = []

  const header = rows[0]?.map(value => value.trim().toLowerCase()) ?? []
  const hasExactHeader = header.length === expectedHeaders.length && expectedHeaders.every((field, index) => header[index] === field)
  const dataRows = hasExactHeader ? rows.slice(1) : []

  if (!hasExactHeader) {
    return {
      delimiter: ",",
      totalRows: rows.length,
      importableRows: [],
      duplicateRows: 0,
      conflictRows: 0,
      invalidRows: rows.length,
      previewRows: rows.map((_, index) => ({
        lineNumber: index + 1,
        status: "invalid",
        message: "Expected header: datetime,systolic,diastolic,comment",
        reading: null,
      })),
    }
  }

  dataRows.forEach((row, index) => {
    const lineNumber = index + 2
    const [datetimeText, sysText, diaText] = row
    const time = parseDateTime(datetimeText)
    const sys = parseInteger(sysText)
    const dia = parseInteger(diaText)

    if (!time || sys === null || dia === null) {
      previewRows.push({
        lineNumber,
        status: "invalid",
        message: "Could not read datetime, systolic, or diastolic from this row",
        reading: null,
      })
      return
    }

    const reading: BPReading = {
      id: crypto.randomUUID(),
      sys,
      dia,
      time,
    }

    const key = readingKey(reading)
    const timeKey = timeOnlyKey(reading.time)

    if (seenKeys.has(key) || existingKeys.has(key)) {
      previewRows.push({
        lineNumber,
        status: "duplicate",
        message: "Duplicate reading skipped",
        reading,
      })
      return
    }

    if (seenTimes.has(timeKey) || existingTimes.has(timeKey)) {
      previewRows.push({
        lineNumber,
        status: "conflict",
        message: "A reading already exists for this minute",
        reading,
      })
      return
    }

    seenKeys.add(key)
    seenTimes.add(timeKey)
    importableRows.push(reading)
    previewRows.push({
      lineNumber,
      status: "ready",
      message: "Ready to import",
      reading,
    })
  })

  return {
    delimiter: ",",
    totalRows: dataRows.length,
    importableRows,
    duplicateRows: previewRows.filter(row => row.status === "duplicate").length,
    conflictRows: previewRows.filter(row => row.status === "conflict").length,
    invalidRows: previewRows.filter(row => row.status === "invalid").length,
    previewRows,
  }
}
