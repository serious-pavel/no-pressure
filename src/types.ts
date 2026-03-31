export interface BPReading {
  id: string,
  sys: number,
  dia: number,
  time: Date,
}

export interface WeightReading {
  weight: number,
  time: Date,
}

export type Grade = 'grade-2' | 'grade-1' | 'high-normal' | 'normal' | 'low' | 'out' | 'unset'

export type PressureType = 'sys' | 'dia'

export type TimeRangeMode = 'calendar' | 'relative'

export type TimeRangeScale = 'week' | 'month' | 'year'

export interface TimeWindow {
  start: Date
  end: Date
}
