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
import {FaCircle} from "react-icons/fa"
import type {IconType} from "react-icons"
import type {BPReading} from "../types.ts"

const DAY_MS = 24 * 60 * 60 * 1000
const MIN_DOT_SIZE = 6
const MAX_DOT_SIZE = 10
const MIN_HIT_SIZE = 22
const DEFAULT_Y_AXIS_MIN = 55
const DEFAULT_Y_AXIS_MAX = 165
const Y_AXIS_EXPAND_PADDING = 5

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getXAxisTickFormatter = (spanMs: number) => {
  if (spanMs >= 240 * DAY_MS) {
    return (value: number) => new Date(value).toLocaleDateString(undefined, {year: "2-digit", month: "short"})
  }

  return (value: number) => new Date(value).toLocaleDateString(undefined, {month: "short", day: "numeric"})
}

const getXAxisTicks = (startMs: number, endMs: number) => {
  const spanMs = endMs - startMs
  const tickCount = spanMs >= 240 * DAY_MS ? 6 : spanMs >= 60 * DAY_MS ? 5 : 4
  if (tickCount <= 1) return [startMs, endMs]

  const step = (endMs - startMs) / (tickCount - 1)
  return Array.from({length: tickCount}, (_, index) => startMs + index * step)
}

const getYAxisDomain = (points: Point[]) => {
  if (!points.length) {
    return [DEFAULT_Y_AXIS_MIN, DEFAULT_Y_AXIS_MAX] as const
  }

  const values = points.map((point) => point.y)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  return [
    minValue < DEFAULT_Y_AXIS_MIN ? Math.floor(minValue - Y_AXIS_EXPAND_PADDING) : DEFAULT_Y_AXIS_MIN,
    maxValue > DEFAULT_Y_AXIS_MAX ? Math.ceil(maxValue + Y_AXIS_EXPAND_PADDING) : DEFAULT_Y_AXIS_MAX,
  ] as const
}

type Point = {
  x: number
  y: number
  kind: PressureType
  id: string
}

type CursorProps = {
  x?: number
  top?: number
  width?: number
  height?: number
  className?: string
  payload?: TooltipContentProps["payload"]
}

type ReadingCursorProps = CursorProps & {
  yAxisDomain: readonly [number, number]
  readingByTime: Map<number, BPReading>
}

const ReadingCursor = ({x, top, width, height, className, payload, yAxisDomain, readingByTime}: ReadingCursorProps) => {
  if (x == null || top == null || width == null || height == null) return null

  const firstPoint = payload?.[0]?.payload as Point | undefined
  const reading = firstPoint?.x != null
    ? readingByTime.get(firstPoint.x)
    : undefined

  if (!reading) return null

  const [minDomain, maxDomain] = yAxisDomain
  const domainSpan = Math.max(1, maxDomain - minDomain)
  const toY = (value: number) => {
    const clampedValue = clamp(value, minDomain, maxDomain)
    return top + height * (1 - ((clampedValue - minDomain) / domainSpan))
  }

  const y1 = toY(reading.sys)
  const y2 = toY(reading.dia)
  const topY = Math.min(y1, y2)
  const bottomY = Math.max(y1, y2)

  return (
    <g className={className} pointerEvents="none">
      <line
        x1={x}
        x2={x}
        y1={topY}
        y2={bottomY}
        stroke="var(--dimmed-text-color)"
        strokeWidth={2}
        strokeDasharray="3 10"
        strokeLinecap="round"
        opacity={0.75}
      />
      <circle cx={x} cy={y1} r={2.4} fill="var(--dimmed-text-color)" opacity={0.65}/>
      <circle cx={x} cy={y2} r={2.4} fill="var(--dimmed-text-color)" opacity={0.65}/>
    </g>
  )
}

const renderCustomDot = (dotSize: number) => ({cx, cy, payload}: ScatterShapeProps) => {
  if (cx == null || cy == null) return null
  const point = payload as Point

  const grade = point.kind === "sys" ? getGrade({sys: point.y, dia: 0}) : getGrade({dia: point.y, sys: 0})
  const offset = dotSize / 2
  const hitSize = Math.max(dotSize * 3, MIN_HIT_SIZE)
  const hitOffset = hitSize / 2

  const iconSet: Record<PressureType, IconType> = {
    'sys': FaCircle,
    'dia': FaCircle,
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
    </>
  )
}

const Graph = ({visibleReadings, timeWindow, children}: VisibleRangeResult & {children: ReactNode}) => {
  const {start, end} = timeWindow
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)

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

  const chartAnchorData = useMemo<Point[]>(() => {
    return [
      {id: "__chart-anchor__", x: start.getTime(), y: DEFAULT_Y_AXIS_MIN, kind: "sys"},
    ]
  }, [start])

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
      bottom: Math.round(-4 + scale * 8),
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

  const xAxisTicks = useMemo(
    () => getXAxisTicks(start.getTime(), end.getTime()),
    [end, start],
  )

  const yAxisDomain = useMemo(
    () => getYAxisDomain([...systolicData, ...diastolicData]),
    [diastolicData, systolicData],
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
            domain={[start.getTime(), end.getTime()]}
            padding={{left: 6, right: 6}}
            minTickGap={8}
            ticks={xAxisTicks}
            tickMargin={6}
            tickFormatter={xAxisTickFormatter}
          />
          <YAxis
            type="number"
            name="pressure"
            domain={yAxisDomain}
            dataKey="y"
            width={yAxisWidth}
            tickMargin={4}
          />
          <Tooltip
            content={renderTooltip}
            cursor={<ReadingCursor yAxisDomain={yAxisDomain} readingByTime={readingByTime} />}
            isAnimationActive={false}
            useTranslate3d={false}
          />
          <Scatter data={chartAnchorData} shape={() => null}/>
          <Scatter data={systolicData} shape={renderCustomDot(dotSize)} isAnimationActive={false}/>
          <Scatter data={diastolicData} shape={renderCustomDot(dotSize)} isAnimationActive={false}/>
        </ScatterChart>
      </ResponsiveContainer>
      {children}
    </div>
  )
}

export default memo(Graph)
