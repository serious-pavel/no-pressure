import {memo, useEffect, useMemo, useRef, useState} from "react"
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
import {FaChevronCircleUp, FaChevronCircleDown, FaCircle} from "react-icons/fa"
import type {IconType} from "react-icons"


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
        <Icon size={size} className={`color-${grade} graphDot`}/>
      </g>
      {/*<circle cx={cx} cy={cy} r={offset} className={`dot-${grade}`}/>*/}
    </>
  )
}

const Graph = ({visibleReadings, timeWindow}: VisibleRangeResult) => {
  const {start, end} = timeWindow
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const rangePadding = useMemo(() => (end.getTime() - start.getTime()) * 0.01, [end, start])

  const systolicData = useMemo<Point[]>(() => visibleReadings.map((reading) => ({
    id: reading.id,
    x: reading.time.getTime(),
    y: reading.sys,
    kind: "sys",
  })), [visibleReadings])

  const diastolicData = useMemo<Point[]>(() => visibleReadings.map((reading) => ({
    id: reading.id,
    x: reading.time.getTime(),
    y: reading.dia,
    kind: "dia",
  })), [visibleReadings])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const updateWidth = () => {
      setWrapperWidth(wrapper.getBoundingClientRect().width)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [])

  const chartMargin = useMemo(() => {
    const scale = Math.min(1, Math.max(0, (wrapperWidth - 320) / 500))

    return {
      top: Math.round(6 + scale * 4),
      right: Math.round(8 + scale * 10),
      bottom: Math.round(6 + scale * 4),
      left: 0,
    }
  }, [wrapperWidth])

  const yAxisWidth = useMemo(() => {
    const scale = Math.min(1, Math.max(0, (wrapperWidth - 320) / 500))
    return Math.round(28 + scale * 10)
  }, [wrapperWidth])

  return (
    <div className="graphWrapper" ref={wrapperRef}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={chartMargin}>
          <XAxis
            type="number"
            name="date"
            dataKey="x"
            domain={[start.getTime() - rangePadding, end.getTime() + rangePadding]}
            padding={{left: 6, right: 6}}
            minTickGap={8}
            interval="preserveStartEnd"
            tickMargin={4}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis
            type="number"
            name="pressure"
            domain={["dataMin - 10", "dataMax + 10"]}
            dataKey="y"
            width={yAxisWidth}
            tickMargin={2}
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

export default memo(Graph)
