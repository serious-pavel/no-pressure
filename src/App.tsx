import {useCallback, useEffect, useMemo, useState, type ReactNode} from "react"
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
import ImportReadingsModal from "./components/ImportReadingsModal.tsx"
import GenericModal from "./components/GenericModal.tsx"
import {
  createReading,
  deleteReading,
  getAuthStartUrl,
  loadReadings,
  loadSession,
  signOut,
  updateReading,
} from "./lib/api.ts"
import Footer from "./components/Footer.tsx";

const storageKey = (scope: string, key: string) => `no-pressure:${scope}:${key}`

interface GenericModalConfig {
  title: string
  body: ReactNode
  important?: boolean
  confirmText: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  getErrorMessage?: (error: unknown) => string
}

const readJson = <T,>(key: string, fallback: T) => {
  const stored = localStorage.getItem(key)
  if (!stored) return fallback

  try {
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function App() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [bplist, setBPList] = useState<BPReading[]>([])
  const [selectedReadingId, setSelectedReadingId] = useState<string>("")
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false)
  const [genericModal, setGenericModal] = useState<GenericModalConfig | null>(null)
  const [genericModalBusy, setGenericModalBusy] = useState<boolean>(false)
  const [genericModalError, setGenericModalError] = useState<string | null>(null)

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
  const canShowApp = Boolean(user) && !authError

  useEffect(() => {
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

  const openModal = useCallback((mode: ModalMode) => {
    setModalMode(mode)
  }, [])

  const openImportModal = useCallback(() => {
    setImportModalOpen(true)
  }, [])

  const openGenericModal = useCallback((config: GenericModalConfig) => {
    setGenericModalError(null)
    setGenericModal(config)
  }, [])

  const closeGenericModal = useCallback(() => {
    if (!genericModalBusy) {
      setGenericModal(null)
      setGenericModalError(null)
    }
  }, [genericModalBusy])

  const handleDeleteReading = useCallback(async () => {
    if (selectedReadingId) {
      await deleteReading(selectedReadingId)
    }

    setBPList(prev => prev.filter(bpListItem => bpListItem.id !== selectedReadingId))
    setModalMode(null)
  }, [selectedReadingId])

  const handleSaveReading = useCallback(async (reading: BPReading) => {
    if (!reading) return

    const savedReading = bplist.some(bpListItem => bpListItem.id === reading.id)
      ? await updateReading(reading)
      : await createReading(reading)

    setBPList(prev => {
      const exists = prev.some(bpListItem => bpListItem.id === savedReading.id)
      return exists ?
        prev.map(bpListItem => bpListItem.id === savedReading.id ? savedReading : bpListItem) :
        [...prev, savedReading]
    })
    setSelectedReadingId(savedReading.id)
    setModalMode(null)
  }, [bplist])

  const handleDeleteAll = useCallback(async () => {
    await Promise.all(bplist.map((reading) => deleteReading(reading.id)))

    setBPList([])
    setSelectedReadingId("")
  }, [bplist])

  const handleOpenDeleteAllModal = useCallback(() => {
    openGenericModal({
      title: "Delete all readings",
      important: true,
      body: "This will permanently delete every reading in your account. This cannot be undone.",
      confirmText: "Delete",
      onConfirm: handleDeleteAll,
      getErrorMessage: (error) => error instanceof Error ? error.message : "Failed to delete readings",
    })
  }, [handleDeleteAll, openGenericModal])

  const handleGenericModalConfirm = useCallback(async () => {
    if (!genericModal) return

    setGenericModalBusy(true)
    setGenericModalError(null)
    try {
      await genericModal.onConfirm()
      setGenericModal(null)
    } catch (error) {
      const fallbackError = error instanceof Error ? error.message : "Something went wrong"
      setGenericModalError(genericModal.getErrorMessage?.(error) ?? fallbackError)
    } finally {
      setGenericModalBusy(false)
    }
  }, [genericModal])

  const handleImportReadings = useCallback(async (readings: BPReading[]) => {
    const importedReadings: BPReading[] = []
    const failedImports: string[] = []

    for (const reading of readings) {
      try {
        const savedReading = await createReading(reading)
        importedReadings.push(savedReading)
      } catch (error) {
        failedImports.push(error instanceof Error ? error.message : "Failed to import a reading")
      }
    }

    if (importedReadings.length > 0) {
      setBPList(prev => [...prev, ...importedReadings])
      setSelectedReadingId(importedReadings[0].id)
    }

    if (failedImports.length > 0) {
      throw new Error(`Imported ${importedReadings.length} readings, ${failedImports.length} failed`)
    }
  }, [])

  const handleSignIn = useCallback(() => {
    window.location.href = getAuthStartUrl()
  }, [])

  const handleSignOut = useCallback(async () => {
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
  }, [])

  return (
    <>
      {importModalOpen && (
        <ImportReadingsModal
          existingReadings={bplist}
          onClose={() => setImportModalOpen(false)}
          onImport={handleImportReadings}
        />
      )}
      {modalMode &&
        <ReadingModal
          mode={modalMode}
          selectedReading={selectedReading}
          onClose={() => setModalMode(null)}
          onDelete={handleDeleteReading}
          onSave={handleSaveReading}
        />
      }
      {genericModal && (
        <GenericModal
          title={genericModal.title}
          body={genericModal.body}
          important={genericModal.important}
          confirmText={genericModal.confirmText}
          cancelText={genericModal.cancelText}
          isConfirming={genericModalBusy}
          errorMessage={genericModalError}
          onClose={closeGenericModal}
          onConfirm={handleGenericModalConfirm}
        />
      )}
      <Header
        user={user}
        isLoading={authLoading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onImportReadings={openImportModal}
        onDeleteAll={handleOpenDeleteAllModal}
        onClearSelection={() => { setSelectedReadingId("") }}
      />
      <main>
        {!authLoading && !user ? (
          <div className="authPromptSlot">
            <section className="authPrompt">
              <div className="authPromptTitle">Sign in to manage your readings</div>
              <div className="authPromptBody">
                Readings are scoped to your account in the backend. Google login uses the server session flow.
              </div>
              <button type="button" className="authPromptButton" onClick={handleSignIn}>
                Continue with Google
              </button>
            </section>
          </div>
        ) : null}
        {user && authError ? (
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
              openModal={openModal}
            />
            <ReadingList
              readings={sortedBPList}
              selectedReadingId={effectiveSelectedId}
              setSelectedReading={setSelectedReadingId}
              openModal={openModal}
            />
            <Graph {...visibleReadings}>
              <TimeRangeControls
                timeRangeMode={timeRangeMode}
                timeRangeScale={timeRangeScale}
                timeRangeOffset={timeRangeOffset}
                setTimeRangeMode={setTimeRangeMode}
                setTimeRangeScale={setTimeRangeScale}
                setTimeRangeOffset={setTimeRangeOffset}
              />
            </Graph>
            <LastWeek days={bucketedWeek}/>
          </>
        )}
      </main>
      <Footer/>
    </>
  )
}

export default App
