import type {AuthSession, BPReading, BPReadingPayload, BPReadingRequestPayload} from "../types.ts"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api"

type ReadingListResponse = {
  readings: BPReadingPayload[]
}

type ReadingItemResponse = {
  reading: BPReadingPayload
}

const buildUrl = (path: string) => {
  const base = apiBaseUrl.replace(/\/$/, "")
  const suffix = path.startsWith("/") ? path : `/${path}`

  if (!base) {
    return suffix
  }

  return `${base}${suffix}`
}

const request = async <T>(path: string, init?: RequestInit) => {
  if (!apiBaseUrl) {
    throw new Error("API base URL is not configured")
  }

  const hasBody = init?.body !== undefined && init.body !== null
  const headers = new Headers(init?.headers ?? {})
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    credentials: "include",
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

const toReading = (reading: BPReadingPayload): BPReading => ({
  ...reading,
  id: reading.id.toString(),
  time: new Date(reading.time),
})

const fromReading = (reading: BPReading): BPReadingRequestPayload => ({
  sys: reading.sys,
  dia: reading.dia,
  time: reading.time.toISOString(),
})

const unwrapReadings = (payload: ReadingListResponse | BPReadingPayload[]) =>
  Array.isArray(payload) ? payload : payload.readings

const unwrapReading = (payload: ReadingItemResponse | BPReadingPayload) =>
  "reading" in payload ? payload.reading : payload

export const hasApiBaseUrl = Boolean(apiBaseUrl)

export const loadSession = async (): Promise<AuthSession> => {
  return request<AuthSession>("/auth/session")
}

export const getAuthStartUrl = (returnTo = window.location.href) =>
  `${buildUrl("/auth/google/start")}?returnTo=${encodeURIComponent(returnTo)}`

export const signOut = async () => {
  await request<void>("/auth/logout", {method: "POST"})
}

export const loadReadings = async (): Promise<BPReading[]> => {
  const readings = await request<ReadingListResponse | BPReadingPayload[]>("/bpreadings")
  return unwrapReadings(readings).map(toReading)
}

export const createReading = async (reading: BPReading): Promise<BPReading> => {
  const created = await request<ReadingItemResponse | BPReadingPayload>("/bpreading", {
    method: "POST",
    body: JSON.stringify(fromReading(reading)),
  })

  return toReading(unwrapReading(created))
}

export const updateReading = async (reading: BPReading): Promise<BPReading> => {
  const updated = await request<ReadingItemResponse | BPReadingPayload>(`/bpreading/${reading.id}`, {
    method: "PUT",
    body: JSON.stringify(fromReading(reading)),
  })

  return toReading(unwrapReading(updated))
}

export const deleteReading = async (readingId: string) => {
  await request<void>(`/bpreading/${readingId}`, {method: "DELETE"})
}

export const createReadingDraft = (time = new Date()): BPReading => ({
  id: crypto.randomUUID(),
  sys: Math.floor(Math.random() * (165 - 110 + 1)) + 110,
  dia: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
  time,
})

export const createRandomWeekDrafts = (): BPReading[] => {
  const readings: BPReading[] = []

  for (let i = 0; i < 14; i++) {
    const dt = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
    const newDate = new Date(dt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)))
    readings.push(createReadingDraft(newDate))
  }

  return readings
}
