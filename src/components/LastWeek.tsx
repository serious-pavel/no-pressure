import type {BucketedWeekday} from "../functions/timeFunctions.ts"
import LastWeekDay from "./LastWeekDay.tsx"

interface LastWeekProps {
  days: BucketedWeekday[]
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
