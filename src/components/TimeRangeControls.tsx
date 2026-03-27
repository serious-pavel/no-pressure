import {FaToggleOn} from "react-icons/fa";
import type {Dispatch, SetStateAction} from "react";
import type {TimeRangeMode, TimeRangeScale} from "../types.ts";

interface TimeRangeControlsProps {
  timeRangeMode: TimeRangeMode,
  timeRangeScale: TimeRangeScale,
  setTimeRangeMode: Dispatch<SetStateAction<TimeRangeMode>>,
  setTimeRangeScale: Dispatch<SetStateAction<TimeRangeScale>>,
}

const TimeRangeControls = ({timeRangeMode, timeRangeScale, setTimeRangeMode, setTimeRangeScale }:TimeRangeControlsProps) => {

  return (
    <div className="timeRangeControlsWrapper">
      <div className="timeRangeModeSwitcher">
        <div className={`timeRangeCalendarMode timeRangeMode ${timeRangeMode === 'calendar' ? 'active' : ''}`}>
          calendar
        </div>
        <FaToggleOn className="timeRangeToggle" />
        <div className={`timeRangeCalendarMode timeRangeMode ${timeRangeMode === 'relative' ? 'active' : ''}`}>
          relative
        </div>
      </div>
      <div className="timeRangeScaleSwitcher">
        <div className="timeRangeScale">
          week
        </div>
        <div className="timeRangeScale">
          month
        </div>
        <div className="timeRangeScale">
          year
        </div>
      </div>
    </div>
  )
}

export default TimeRangeControls