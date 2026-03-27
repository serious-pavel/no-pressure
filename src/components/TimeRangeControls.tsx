import {FaToggleOn} from "react-icons/fa";

const TimeRangeControls = () => {
  return (
    <div className="timeRangeControlsWrapper">
      <div className="timeRangeModeSwitcher">
        <div className="timeRangeCalendarMode timeRangeMode">
          calendar
        </div>
        <FaToggleOn className="timeRangeToggle"/>
        <div className="timeRangeRelativeMode timeRangeMode">
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