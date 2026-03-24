import type {BPReading} from "../types.ts";

const LatestReading = ({reading} : { reading?: BPReading }) => {
  if (!reading) return <h3>No reading yet</h3>
  const {sys, dia, time} = reading
  return (
    <h3>
      Latest {new Date(time).toLocaleString()}: {sys}/{dia}
    </h3>
  )
}

export default LatestReading