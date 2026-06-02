import {useMemo, useState, type Dispatch, type SetStateAction} from "react"
import {FaArrowCircleLeft, FaArrowCircleRight, FaChevronDown} from "react-icons/fa"
import type {TimeRangeMode, TimeRangeScale} from "../types.ts"
import {getAlignedTimeRangeOffset, getWindowBounds} from "../functions/timeRangeHelper.tsx"

interface TimeRangeControlsProps {
  timeRangeMode: TimeRangeMode
  timeRangeScale: TimeRangeScale
  timeRangeOffset: number
  setTimeRangeMode: Dispatch<SetStateAction<TimeRangeMode>>
  setTimeRangeScale: Dispatch<SetStateAction<TimeRangeScale>>
  setTimeRangeOffset: Dispatch<SetStateAction<number>>
}

const SCALE_LABELS: Record<TimeRangeScale, string> = {
  week: "week",
  month: "month",
  year: "year",
}

const getWeekNumber = (date: Date) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNumber = utcDate.getUTCDay() || 7

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber)

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const getCalendarModeLabel = (timeRangeScale: TimeRangeScale, periodStart: Date) => {
  if (timeRangeScale === "week") {
    return `Week ${getWeekNumber(periodStart)}`
  }

  if (timeRangeScale === "month") {
    return periodStart.toLocaleDateString(undefined, {month: "long"})
  }

  return periodStart.toLocaleDateString(undefined, {year: "numeric"})
}

const getRelativeModeLabel = (timeRangeScale: TimeRangeScale, timeRangeOffset: number) => {
  const unit = SCALE_LABELS[timeRangeScale]

  if (timeRangeOffset === 0) {
    return `This ${unit}`
  }

  if (timeRangeOffset === -1) {
    return `Last ${unit}`
  }

  if (timeRangeOffset === 1) {
    return `Next ${unit}`
  }

  const distance = Math.abs(timeRangeOffset)
  const pluralUnit = distance === 1 ? unit : `${unit}s`

  return timeRangeOffset < 0
    ? `${distance} ${pluralUnit} ago`
    : `In ${distance} ${pluralUnit}`
}

const TimeRangeControls = ({timeRangeMode, timeRangeScale, timeRangeOffset, setTimeRangeMode, setTimeRangeScale, setTimeRangeOffset}:TimeRangeControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const timeWindow = useMemo(
    () => getWindowBounds(timeRangeScale, timeRangeMode, timeRangeOffset),
    [timeRangeMode, timeRangeOffset, timeRangeScale],
  )

  const periodLabel = timeRangeMode === "calendar"
    ? getCalendarModeLabel(timeRangeScale, timeWindow.start)
    : getRelativeModeLabel(timeRangeScale, timeRangeOffset)

  const handleScaleChange = (nextScale: TimeRangeScale) => {
    setTimeRangeOffset(prevOffset => getAlignedTimeRangeOffset(timeRangeScale, timeRangeMode, prevOffset, nextScale))
    setTimeRangeScale(nextScale)
  }

  return (
    <div className={`timeRangeControlsWrapper ${isExpanded ? "expanded" : ""}`}>
      <button
        className="timeRangeControlsToggle"
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Hide time range controls" : "Show time range controls"}
        title={isExpanded ? "Hide time range controls" : "Show time range controls"}
      >
        <span className="timeRangeControlsToggleLabel">{periodLabel}</span>
        <FaChevronDown className="timeRangeControlsToggleIcon" />
      </button>
      <div className="timeRangeControlsPanel">
        <div className="timeRangeModeSwitcher">
          <button
            className={`timeRangeModeButton ${timeRangeMode === "calendar" ? "active" : ""}`}
            type="button"
            onClick={() => setTimeRangeMode("calendar")}
            aria-pressed={timeRangeMode === "calendar"}
          >
            calendar
          </button>
          <button
            className={`timeRangeModeButton ${timeRangeMode === "relative" ? "active" : ""}`}
            type="button"
            onClick={() => setTimeRangeMode("relative")}
            aria-pressed={timeRangeMode === "relative"}
          >
            relative
          </button>
        </div>
        <div className="timeRangeOffsetSwitcher">
          <button
            className="timeRangeOffsetButton"
            type="button"
            onClick={() => setTimeRangeOffset(prev => prev - 1)}
            aria-label={`Previous ${SCALE_LABELS[timeRangeScale]}`}
            title={`Previous ${SCALE_LABELS[timeRangeScale]}`}
          >
            <FaArrowCircleLeft />
          </button>
          <div className="timeRangeOffset">
            {periodLabel}
          </div>
          <button
            className="timeRangeOffsetButton"
            type="button"
            onClick={() => setTimeRangeOffset(prev => prev + 1)}
            aria-label={`Next ${SCALE_LABELS[timeRangeScale]}`}
            title={`Next ${SCALE_LABELS[timeRangeScale]}`}
          >
            <FaArrowCircleRight />
          </button>
        </div>
        <div className="timeRangeScaleSwitcher">
          <button
            className={`timeRangeScaleButton ${timeRangeScale === "week" ? "active" : ""}`}
            type="button"
            onClick={() => handleScaleChange("week")}
            aria-pressed={timeRangeScale === "week"}
          >
            week
          </button>
          <button
            className={`timeRangeScaleButton ${timeRangeScale === "month" ? "active" : ""}`}
            type="button"
            onClick={() => handleScaleChange("month")}
            aria-pressed={timeRangeScale === "month"}
          >
            month
          </button>
          <button
            className={`timeRangeScaleButton ${timeRangeScale === "year" ? "active" : ""}`}
            type="button"
            onClick={() => handleScaleChange("year")}
            aria-pressed={timeRangeScale === "year"}
          >
            year
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimeRangeControls
