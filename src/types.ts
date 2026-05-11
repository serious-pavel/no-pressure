export interface BPReading {
  id: string
  sys: number
  dia: number
  time: Date
}

export interface BPReadingPayload {
  id: number
  sys: number
  dia: number
  time: string
}

export interface BPReadingRequestPayload {
  sys: number
  dia: number
  time?: string
}

export interface AppUser {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

export interface AuthSession {
  user: AppUser | null
}

export interface WeightReading {
  weight: number
  time: Date
}

export type Grade = 'grade-2' | 'grade-1' | 'high-normal' | 'normal' | 'low' | 'out' | 'unset'

export type PressureType = 'sys' | 'dia'

export type TimeRangeMode = 'calendar' | 'relative'

export type TimeRangeScale = 'week' | 'month' | 'year'

export interface TimeWindow {
  start: Date
  end: Date
}

export interface VisibleRangeResult {
  visibleReadings: BPReading[]
  timeWindow: TimeWindow
}

export type ModalMode = 'add' | 'edit' | 'delete' | null