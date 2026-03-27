import {FaToggleOn} from "react-icons/fa";
import type {Dispatch, SetStateAction} from "react";
import type {TimeRangeMode, TimeRangeScale} from "../types.ts";

interface TimeRangeControlsProps {
  timeRangeMode: TimeRangeMode,
  timeRangeScale: TimeRangeScale,
  setTimeRangeMode: Dispatch<SetStateAction<TimeRangeMode>>,
  setTimeRangeScale: Dispatch<SetStateAction<TimeRangeScale>>,
}

const TimeRangeControls = ({timeRangeMode, timeRangeScale, setTimeRangeMode, setTimeRangeScale}:TimeRangeControlsProps) => {
  const toggleTimeRangeMode = () => {
    setTimeRangeMode(prev => prev === 'calendar' ? 'relative' : 'calendar')
  }

  return (
    <div className="timeRangeControlsWrapper">
      <div className="timeRangeModeSwitcher" onClick={toggleTimeRangeMode}>
        <div className={`timeRangeCalendarMode timeRangeMode ${timeRangeMode === 'calendar' ? 'active' : ''}`}>
          calendar
        </div>
        <FaToggleOn className="timeRangeToggle" />
        <div className={`timeRangeCalendarMode timeRangeMode ${timeRangeMode === 'relative' ? 'active' : ''}`}>
          relative
        </div>
      </div>
      <div className="timeRangeScaleSwitcher">
        <div
          className={`timeRangeScale ${timeRangeScale === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRangeScale("week")}
        >
          week
        </div>
        <div
          className={`timeRangeScale ${timeRangeScale === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRangeScale("month")}
        >
          month
        </div>
        <div
          className={`timeRangeScale ${timeRangeScale === 'year' ? 'active' : ''}`}
          onClick={() => setTimeRangeScale("year")}
        >
          year
        </div>
      </div>
    </div>
  )
}

export default TimeRangeControls