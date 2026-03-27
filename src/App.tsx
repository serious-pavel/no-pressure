import {useEffect, useMemo, useState} from "react";
import type {BPReading, TimeRangeMode, TimeRangeScale} from "./types.ts";
import ReadingList from "./components/ReadingList.tsx";
import Graph from "./components/Graph.tsx";
import {getBucketedReadings, readingsLastNDays} from "./functions/timeFunctions.ts";
import LastWeek from "./components/LastWeek.tsx";
import AddReading from "./components/AddReading.tsx";
import TimeRangeControls from "./components/TimeRangeControls.tsx";

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

function App() {
  const [bplist, setBPList] = useState<BPReading[]>(initialBPList)
  const [selectedReadingId, setSelectedReadingId] = useState<string>(initialSelectedReadingId)

  // time range controls states
  const [timeRangeMode, setTimeRangeMode] = useState<TimeRangeMode>('calendar')
  const [timeRangeScale, setTimeRangeScale] = useState<TimeRangeScale>('week')

  const sortedBPList = useMemo(
    () => [...bplist].sort(
      (a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      }
    ), [bplist]
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
        <Graph readings={sortedBPList}/>
        <LastWeek days={bucketedWeek}/>
        <TimeRangeControls/>
      </main>
      <footer>FOOTER</footer>
    </>
  )
}

export default App
