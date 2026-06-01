import {memo, useEffect, useMemo, useRef, useState, type ReactNode} from "react"
import type {PressureType, VisibleRangeResult} from "../types.ts"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  type ScatterShapeProps,
  type TooltipContentProps
} from 'recharts'
import {getGrade} from "../functions/colorFunctions.ts"
import {FaChevronCircleUp, FaChevronCircleDown, FaCircle} from "react-icons/fa"
import type {IconType} from "react-icons"

const DAY_MS = 24 * 60 * 60 * 1000
const MIN_DOT_SIZE = 6
const MAX_DOT_SIZE = 10
const MIN_HIT_SIZE = 22

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getXAxisTickFormatter = (spanMs: number) => {
  if (spanMs >= 240 * DAY_MS) {
    return (value: number) => new Date(value).toLocaleDateString(undefined, {year: "2-digit", month: "short"})
  }

  return (value: number) => new Date(value).toLocaleDateString(undefined, {month: "short", day: "numeric"})
}

const getXAxisTickCount = (spanMs: number) => {
  if (spanMs >= 240 * DAY_MS) return 6
  if (spanMs >= 60 * DAY_MS) return 5
  return 4
}

type Point = {
  x: number
  y: number
  kind: PressureType
  id: string
}

const renderCustomDot = (dotSize: number) => ({cx, cy, payload}: ScatterShapeProps) => {
  if (cx == null || cy == null) return null
  const point = payload as Point

  const grade = point.kind === "sys" ? getGrade({sys: point.y, dia: 0}) : getGrade({dia: point.y, sys: 0})
  const offset = dotSize / 2
  const hitSize = Math.max(dotSize * 3, MIN_HIT_SIZE)
  const hitOffset = hitSize / 2

  const iconSet: Record<PressureType, IconType> = {
    'sys': FaChevronCircleUp,
    'dia': FaChevronCircleDown,
  }

  const Icon = iconSet[point.kind] ?? FaCircle

  return (
    <>
      <g transform={`translate(${cx - hitOffset}, ${cy - hitOffset})`}>
        <circle
          cx={hitOffset}
          cy={hitOffset}
          r={hitOffset}
          fill="transparent"
          pointerEvents="all"
        />
        <g transform={`translate(${hitOffset - offset}, ${hitOffset - offset})`} pointerEvents="none">
          <Icon size={dotSize} className={`color-${grade} graphDot`}/>
        </g>
      </g>
      {/*<circle cx={cx} cy={cy} r={offset} className={`dot-${grade}`}/>*/}
    </>
  )
}

const Graph = ({visibleReadings, timeWindow, children}: VisibleRangeResult & {children: ReactNode}) => {
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

  const readingByTime = useMemo(() => {
    return new Map(visibleReadings.map((reading) => [reading.time.getTime(), reading]))
  }, [visibleReadings])

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

  const dotSize = useMemo(() => {
    const pointCount = Math.max(1, visibleReadings.length * 2)
    const widthBasedSize = wrapperWidth > 0
      ? Math.round(wrapperWidth / 96)
      : MAX_DOT_SIZE
    const densityBasedSize = wrapperWidth > 0
      ? Math.round((wrapperWidth / pointCount) * 0.9)
      : MAX_DOT_SIZE

    return clamp(Math.min(widthBasedSize, densityBasedSize), MIN_DOT_SIZE, MAX_DOT_SIZE)
  }, [visibleReadings.length, wrapperWidth])

  const xAxisTickFormatter = useMemo(
    () => getXAxisTickFormatter(end.getTime() - start.getTime()),
    [end, start],
  )

  const xAxisTickCount = useMemo(
    () => getXAxisTickCount(end.getTime() - start.getTime()),
    [end, start],
  )

  const renderTooltip = ({active, payload}: TooltipContentProps) => {
    if (!active || !payload?.length) return null

    const firstPoint = payload[0]?.payload as Point | undefined
    const timestamp = firstPoint?.x
    const reading = timestamp != null
      ? readingByTime.get(timestamp) ?? visibleReadings.find((item) => item.id === firstPoint?.id)
      : undefined

    if (!reading) return null

    return (
      <div className="recharts-default-tooltip" style={{margin: 0, padding: "8px 12px"}}>
        <p className="recharts-tooltip-label" style={{margin: 0}}>
          {new Date(timestamp ?? reading.time.getTime()).toLocaleString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="recharts-tooltip-item-list" style={{margin: "4px 0 0"}}>
          <span>Systolic: {reading.sys}</span>
          <br />
          <span>Diastolic: {reading.dia}</span>
        </div>
      </div>
    )
  }

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
            tickCount={xAxisTickCount}
            tickMargin={4}
            tickFormatter={xAxisTickFormatter}
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
            content={renderTooltip}
            isAnimationActive={false}
            useTranslate3d={false}
          />
          <Scatter data={systolicData} shape={renderCustomDot(dotSize)}/>
          <Scatter data={diastolicData} shape={renderCustomDot(dotSize)}/>
        </ScatterChart>
      </ResponsiveContainer>
      {children}
    </div>
  )
}

export default memo(Graph)
