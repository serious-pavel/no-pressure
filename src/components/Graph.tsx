import type {BPReading} from "../types.ts"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  type ScatterShapeProps
} from 'recharts';
import {getGrade} from "../functions/colorFunctions.ts";


interface GraphProps {
  readings: BPReading[]
}

type Point = {
  x: number;
  y: number;
  kind: "sys" | "dia";
  id: string;
}

const renderCustomDot = ({cx, cy, payload}: ScatterShapeProps) => {
  const grade = payload.kind === "sys" ? getGrade({sys: payload.y, dia: 0}) : getGrade({dia: payload.y, sys: 0})
  return (
    <circle cx={cx} cy={cy} r={4} className={`dot-${grade}`}/>
  )
}

const Graph = ({readings}: GraphProps) => {
  const systolicData: Point[] = readings.map((reading) => ({
    id: reading.id,
    x: reading.time.getTime(),
    y: reading.sys,
    kind: "sys",
  }));

  const diastolicData: Point[] = readings.map((reading) => ({
    id: reading.id,
    x: reading.time.getTime(),
    y: reading.dia,
    kind: "dia",
  }));

  return (
    <div className="graphWrapper">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{top: 15, right: 30, bottom: 15, left: 0}}>
          <XAxis
            type="number"
            name="date"
            dataKey="x"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis
            type="number"
            name="pressure"
            domain={["dataMin - 10", "dataMax + 10"]}
            dataKey="y"
          />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Scatter data={systolicData} shape={renderCustomDot}/>
          <Scatter data={diastolicData} shape={renderCustomDot}/>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Graph