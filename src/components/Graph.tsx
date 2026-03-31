import type {PressureType, VisibleRangeResult} from "../types.ts"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  type ScatterShapeProps
} from 'recharts'
import {getGrade} from "../functions/colorFunctions.ts"
import {FaChevronCircleUp, FaChevronCircleDown, FaCircle} from "react-icons/fa";
import type {IconType} from "react-icons";


type Point = {
  x: number
  y: number
  kind: PressureType
  id: string
}

const renderCustomDot = ({cx, cy, payload}: ScatterShapeProps) => {
  if (cx == null || cy == null) return null
  const point = payload as Point

  const grade = point.kind === "sys" ? getGrade({sys: point.y, dia: 0}) : getGrade({dia: point.y, sys: 0})
  const size = 10
  const offset = size / 2

  const iconSet: Record<PressureType, IconType> = {
    'sys': FaChevronCircleUp,
    'dia': FaChevronCircleDown,
  }

  const Icon = iconSet[point.kind] ?? FaCircle

  return (
    <>
      <g transform={`translate(${cx - offset}, ${cy - offset})`}>
        <Icon size={size} className={`dot-${grade}`}/>
      </g>
      {/*<circle cx={cx} cy={cy} r={offset} className={`dot-${grade}`}/>*/}
    </>
  )
}

const Graph = ({visibleReadings, timeWindow}: VisibleRangeResult) => {
  const systolicData: Point[] = visibleReadings.map((reading) => ({
    id: reading.id,
    x: reading.time.getTime(),
    y: reading.sys,
    kind: "sys",
  }))

  const diastolicData: Point[] = visibleReadings.map((reading) => ({
    id: reading.id,
    x: reading.time.getTime(),
    y: reading.dia,
    kind: "dia",
  }))

  return (
    <div className="graphWrapper">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{top: 15, right: 30, bottom: 15, left: 0}}>
          <XAxis
            type="number"
            name="date"
            dataKey="x"
            domain={["dataMin - 20000000", "dataMax + 20000000"]}
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