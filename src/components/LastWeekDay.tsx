import {memo} from "react"
import type {Grade} from "../types.ts"
import {getGrade} from "../functions/colorFunctions.ts"
import type {BucketedWeekday} from "../functions/timeFunctions.ts"
import {
  FaCircle,
  FaRegFlushed,
  FaRegGrin,
  FaRegMeh,
  FaRegDizzy,
  FaRegSmile,
  FaRegMehRollingEyes,
  FaRegDotCircle
} from "react-icons/fa"
import type {IconType} from "react-icons"

interface LastWeekDayProps {
  day: BucketedWeekday
}

const getMaxReading = (dayReadings: BucketedWeekday["readings"]) => ({
  sys: Math.max(...dayReadings.map(reading => reading.sys)),
  dia: Math.max(...dayReadings.map(reading => reading.dia)),
})

const iconMap: Record<Grade, IconType> = {
  'grade-2': FaRegFlushed,
  'grade-1': FaRegMeh,
  'high-normal': FaRegSmile,
  'normal': FaRegGrin,
  'low': FaRegMehRollingEyes,
  'out': FaRegDizzy,
  'unset': FaRegDotCircle,
}

const LastWeekDay = ({day}: LastWeekDayProps) => {
  const isDayEmpty = day.readings.length === 0
  const maxReading = isDayEmpty ? null : getMaxReading(day.readings)
  const grade: Grade = !maxReading ? "unset" : getGrade(maxReading)
  const Icon = iconMap[grade] ?? FaCircle

  return (
    <div className={`weekDay color-${grade}`}>
      <div className="weekDayName">{day.dayLabel}</div>
      <div className="weekDayReading">
        {maxReading ? (
          <>
            <div className="value valueSys">{maxReading.sys}</div>
            <div className={`valueMid divider`}></div>
            <div className="value valueDia">{maxReading?.dia}</div>
          </>
        ) : (
          <div className={`valueMid`}>
            -
          </div>
        )}

      </div>
      <div className="weekDayBottom">
        <Icon className={`weekDayIcon color-${grade}`}/>
      </div>
    </div>
  )
}

export default memo(LastWeekDay)
