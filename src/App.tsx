import {useEffect, useMemo, useState} from "react";
import type {BPReading, TimeRangeMode, TimeRangeScale} from "./types.ts";
import ReadingList from "./components/ReadingList.tsx";
import Graph from "./components/Graph.tsx";
import {getBucketedReadings, readingsLastNDays} from "./functions/timeFunctions.ts";
import LastWeek from "./components/LastWeek.tsx";
import AddReading from "./components/AddReading.tsx";
import TimeRangeControls from "./components/TimeRangeControls.tsx";
import {getVisibleReadings} from "./functions/timeRangeHelper.tsx";

const initialBPList: BPReading[] =
  localStorage.getItem('bplist')
    ? JSON.parse(localStorage.getItem('bplist')!)
      .map((reading: BPReading) => (
        {
          ...reading,
          time: new Date(reading.time),
        }
      )) as BPReading[]
    : []

const initialSelectedReadingId: string =
  localStorage.getItem('selectedReading')
    ? JSON.parse(localStorage.getItem('selectedReading')!)
    : (initialBPList.at(-1)?.id ?? "")

const initialTimeRangeMode: TimeRangeMode =
  localStorage.getItem('timeRangeMode')
    ? JSON.parse(localStorage.getItem('timeRangeMode')!)
    : "relative"

const initialTimeRangeScale: TimeRangeScale =
  localStorage.getItem('timeRangeScale')
    ? JSON.parse(localStorage.getItem('timeRangeScale')!)
    : "week"

function App() {
  const [bplist, setBPList] = useState<BPReading[]>(initialBPList)
  const [selectedReadingId, setSelectedReadingId] = useState<string>(initialSelectedReadingId)

  // time range controls states
  const [timeRangeMode, setTimeRangeMode] = useState<TimeRangeMode>(initialTimeRangeMode)
  const [timeRangeScale, setTimeRangeScale] = useState<TimeRangeScale>(initialTimeRangeScale)
  const [timeRangeOffset, setTimeRangeOffset] = useState<number>(0)

  const sortedBPList = useMemo(
    () => [...bplist].sort(
      (a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      }
    ), [bplist]
  )

  const visibleReadings = useMemo(
    () => getVisibleReadings(sortedBPList, timeRangeScale, timeRangeMode, timeRangeOffset),
    [sortedBPList, timeRangeMode, timeRangeOffset, timeRangeScale]
  )

  const bucketedWeek = useMemo(
    () => getBucketedReadings(readingsLastNDays(sortedBPList, 7)), [sortedBPList]
  )

  const effectiveSelectedId = useMemo(
    () => {
      if (!sortedBPList) return ""

      const exists = selectedReadingId ? sortedBPList.some(reading => reading.id === selectedReadingId) : false
      return exists ? selectedReadingId : sortedBPList.at(0)?.id ?? ""
    }, [selectedReadingId, sortedBPList]
  )

  console.log("sel: ", selectedReadingId)

  useEffect(() => {
    localStorage.setItem('bplist', JSON.stringify(bplist))
  }, [bplist])

  useEffect(() => {
    localStorage.setItem('selectedReading', JSON.stringify(selectedReadingId))
    console.log("ef", selectedReadingId)
  }, [selectedReadingId])

  useEffect(() => {
    localStorage.setItem('timeRangeMode', JSON.stringify(timeRangeMode))
  }, [timeRangeMode])

  useEffect(() => {
    localStorage.setItem('timeRangeScale', JSON.stringify(timeRangeScale))
  }, [timeRangeScale]);

  return (
    <>
      <header>HEADER</header>
      <main className="main">
        <AddReading setBPList={setBPList} setSelectedReading={setSelectedReadingId}/>
        <ReadingList
          readings={sortedBPList}
          selectedReadingId={effectiveSelectedId}
          setBPList={setBPList}
          setSelectedReading={setSelectedReadingId}
        />
        <Graph readings={visibleReadings}/>
        <LastWeek days={bucketedWeek}/>
        <TimeRangeControls
          timeRangeMode={timeRangeMode}
          timeRangeScale={timeRangeScale}
          timeRangeOffset={timeRangeOffset}
          setTimeRangeMode={setTimeRangeMode}
          setTimeRangeScale={setTimeRangeScale}
          setTimeRangeOffset={setTimeRangeOffset}
        />
      </main>
      <footer>FOOTER</footer>
    </>
  )
}

export default App
