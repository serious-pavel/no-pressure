import type {BPReading} from "../types.ts"
import {getGrade} from "../functions/colorFunctions.ts";

interface GraphProps {
  readings: BPReading[]
}

const Graph = ({readings}: GraphProps) => {

  return (
    <div className="graphWrapper">
      {readings.map((reading) =>
        <div key={reading.id} className={`readingDot dot-${getGrade(reading)}`}>
        </div>)}
    </div>
  )
}

export default Graph