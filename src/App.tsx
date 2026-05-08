import {useEffect, useMemo, useState} from "react"
import type {AppUser, BPReading, ModalMode, TimeRangeMode, TimeRangeScale} from "./types.ts"
import ReadingList from "./components/ReadingList.tsx"
import Graph from "./components/Graph.tsx"
import {getBucketedReadings, readingsLastNDays} from "./functions/timeFunctions.ts"
import LastWeek from "./components/LastWeek.tsx"
import AddReading from "./components/AddReading.tsx"
import TimeRangeControls from "./components/TimeRangeControls.tsx"
import {getVisibleReadings} from "./functions/timeRangeHelper.tsx"
import ReadingModal from "./components/ReadingModal.tsx"
import Header from "./components/Header.tsx"
import {
  createRandomWeekDrafts,
  createReading,
  createReadingDraft,
  deleteReading,
  getAuthStartUrl,
  hasApiBaseUrl,
  loadReadings,
  loadSession,
  signOut,
  updateReading,
} from "./lib/api.ts"

const storageKey = (scope: string, key: string) => `no-pressure:${scope}:${key}`

const readJson = <T,>(key: string, fallback: T) => {
  const stored = localStorage.getItem(key)
  if (!stored) return fallback

  try {
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

const loadLocalReadings = () =>
  readJson<BPReading[]>(storageKey("local", "bplist"), []).map((reading) => ({
    ...reading,
    time: new Date(reading.time),
  }))

function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(hasApiBaseUrl)
  const [authError, setAuthError] = useState<string | null>(null)
  const [bplist, setBPList] = useState<BPReading[]>(() => hasApiBaseUrl ? [] : loadLocalReadings())
  const [selectedReadingId, setSelectedReadingId] = useState<string>("")

  // time range controls states
  const [timeRangeMode, setTimeRangeMode] = useState<TimeRangeMode>("relative")
  const [timeRangeScale, setTimeRangeScale] = useState<TimeRangeScale>("week")
  const [timeRangeOffset, setTimeRangeOffset] = useState<number>(0)

  // modal window states
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  const storageScope = user?.id ?? "local"

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

  const selectedReading = useMemo(
    () => sortedBPList.find(reading => reading.id === effectiveSelectedId) ?? null,
    [sortedBPList, effectiveSelectedId]
  )
  const canShowApp = !hasApiBaseUrl || (Boolean(user) && !authError)

  useEffect(() => {
    if (hasApiBaseUrl) {
      void (async () => {
        try {
          setAuthError(null)
          const currentSession = await loadSession()
          setUser(currentSession.user)

          const scope = currentSession.user?.id ?? "local"
          setSelectedReadingId(readJson<string>(storageKey(scope, "selectedReading"), ""))
          setTimeRangeMode(readJson<TimeRangeMode>(storageKey(scope, "timeRangeMode"), "relative"))
          setTimeRangeScale(readJson<TimeRangeScale>(storageKey(scope, "timeRangeScale"), "week"))

          if (currentSession.user) {
            try {
              const readings = await loadReadings()
              setBPList(readings)
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to load readings"
              setAuthError(message)
              setBPList([])
              if (/unauthorized/i.test(message)) {
                setUser(null)
              }
            }
          } else {
            setBPList([])
          }
        } catch (error) {
          setAuthError(error instanceof Error ? error.message : "Failed to connect to the API")
          setBPList([])
          setUser(null)
        } finally {
          setAuthLoading(false)
        }
      })()
      return
    }

    setSelectedReadingId(readJson<string>(storageKey("local", "selectedReading"), ""))
    setTimeRangeMode(readJson<TimeRangeMode>(storageKey("local", "timeRangeMode"), "relative"))
    setTimeRangeScale(readJson<TimeRangeScale>(storageKey("local", "timeRangeScale"), "week"))
    setAuthLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem(storageKey(storageScope, "selectedReading"), JSON.stringify(selectedReadingId))
  }, [selectedReadingId, storageScope])

  useEffect(() => {
    localStorage.setItem(storageKey(storageScope, "timeRangeMode"), JSON.stringify(timeRangeMode))
  }, [timeRangeMode, storageScope])

  useEffect(() => {
    localStorage.setItem(storageKey(storageScope, "timeRangeScale"), JSON.stringify(timeRangeScale))
  }, [timeRangeScale, storageScope])

  useEffect(() => {
    if (hasApiBaseUrl) return
    localStorage.setItem(storageKey("local", "bplist"), JSON.stringify(bplist))
  }, [bplist])

  const openModal = (mode: ModalMode) => {
    setModalMode(mode)
  }

  const handleDeleteReading = async () => {
    if (hasApiBaseUrl && selectedReadingId) {
      await deleteReading(selectedReadingId)
    }

    setBPList(prev => prev.filter(bpListItem => bpListItem.id !== selectedReadingId))
    setModalMode(null)
  }

  const handleSaveReading = async (reading: BPReading) => {
    if (!reading) return

    const savedReading = hasApiBaseUrl
      ? (bplist.some(bpListItem => bpListItem.id === reading.id) ? await updateReading(reading) : await createReading(reading))
      : reading

    setBPList(prev => {
      const exists = prev.some(bpListItem => bpListItem.id === savedReading.id)
      return exists ?
        prev.map(bpListItem => bpListItem.id === savedReading.id ? savedReading : bpListItem) :
        [...prev, savedReading]
    })
    setSelectedReadingId(savedReading.id)
    setModalMode(null)
  }

  const handleCreateRandomReading = async () => {
    await handleSaveReading(createReadingDraft())
  }

  const handleCreateRandomWeek = async () => {
    const drafts = createRandomWeekDrafts()

    if (hasApiBaseUrl) {
      const saved = await Promise.all(drafts.map((reading) => createReading(reading)))
      setBPList(prev => [...prev, ...saved])
      if (saved.length > 0) {
        setSelectedReadingId(saved[0].id)
      }
      return
    }

    setBPList(prev => [...prev, ...drafts])
  }

  const handleClearAll = async () => {
    if (hasApiBaseUrl) {
      await Promise.all(bplist.map((reading) => deleteReading(reading.id)))
    }

    setBPList([])
    setSelectedReadingId("")
  }

  const handleSignIn = () => {
    window.location.href = getAuthStartUrl()
  }

  const handleSignOut = async () => {
    setUser(null)
    setAuthError(null)
    setBPList([])
    setSelectedReadingId("")
    setAuthLoading(false)

    try {
      await signOut()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Failed to sign out")
    }
  }

  return (
    <>
      {modalMode &&
        <ReadingModal
          mode={modalMode}
          selectedReading={selectedReading}
          onClose={() => setModalMode(null)}
          onDelete={handleDeleteReading}
          onSave={handleSaveReading}
        />
      }
      <Header
        user={user}
        isLoading={authLoading}
        hasApiBaseUrl={hasApiBaseUrl}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
      <main className="main">
        {hasApiBaseUrl && !authLoading && !user ? (
          <div className="authPromptSlot">
            <section className="authPrompt">
              <div className="authPromptTitle">Sign in to manage your readings</div>
              <div className="authPromptBody">
                Readings are scoped to your account in the backend. Google login uses the server session flow.
              </div>
              {authError && <div className="authPromptError">{authError}</div>}
              <button type="button" className="authPromptButton" onClick={handleSignIn}>
                Continue with Google
              </button>
            </section>
          </div>
        ) : null}
        {hasApiBaseUrl && authError ? (
          <div className="authPromptSlot">
            <section className="authPrompt">
              <div className="authPromptTitle">Could not load readings</div>
              <div className="authPromptBody">{authError}</div>
            </section>
          </div>
        ) : null}
        {canShowApp && (
          <>
            <AddReading
              onCreateRandomReading={() => { void handleCreateRandomReading() }}
              onCreateRandomWeek={() => { void handleCreateRandomWeek() }}
              onClearAll={() => { void handleClearAll() }}
              onClearSelection={() => { setSelectedReadingId("") }}
              openModal={openModal}
            />
            <ReadingList
              readings={sortedBPList}
              selectedReadingId={effectiveSelectedId}
              setSelectedReading={setSelectedReadingId}
              openModal={openModal}
            />
            <Graph {...visibleReadings}/>
            <LastWeek days={bucketedWeek}/>
            <TimeRangeControls
              timeRangeMode={timeRangeMode}
              timeRangeScale={timeRangeScale}
              timeRangeOffset={timeRangeOffset}
              setTimeRangeMode={setTimeRangeMode}
              setTimeRangeScale={setTimeRangeScale}
              setTimeRangeOffset={setTimeRangeOffset}
            />
          </>
        )}
      </main>
      <footer>FOOTER</footer>
    </>
  )
}

export default App
