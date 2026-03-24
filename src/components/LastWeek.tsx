import type {BPReading} from "../types"
import LastWeekDay from "./LastWeekDay.tsx";

interface LastWeekProps {
  days: BPReading[][]
}

const LastWeek = ({days}: LastWeekProps) => {

  return (
    <div className="lastWeekWrapper">
      {days.map((day, index) =>
        (
          <LastWeekDay key={index} day={day}/>
        )
      )}
    </div>
  )
}

export default LastWeek
