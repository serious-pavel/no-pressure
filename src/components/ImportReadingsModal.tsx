import {useMemo, useRef, useState, type ChangeEvent} from "react"
import type {BPReading} from "../types.ts"
import {parseBloodPressureCsv, type CsvImportResult} from "../functions/csvImport.ts"
import {useModalDismiss} from "../hooks/useModalDismiss.ts"

interface ImportReadingsModalProps {
  existingReadings: BPReading[]
  onClose: () => void
  onImport: (readings: BPReading[]) => Promise<void> | void
}

const previewLimit = 8

const ImportReadingsModal = ({existingReadings, onClose, onImport}: ImportReadingsModalProps) => {
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const [parseResult, setParseResult] = useState<CsvImportResult | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const {handleOverlayClick} = useModalDismiss<HTMLDivElement>(onClose)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setModalError(null)
    setParseResult(null)
    setSelectedFileName("")

    if (!file) return

    setIsParsing(true)
    try {
      const text = await file.text()
      const result = parseBloodPressureCsv(text, existingReadings)
      setSelectedFileName(file.name)
      setParseResult(result)
      if (result.importableRows.length === 0) {
        setModalError("No importable readings were found in this file.")
      }
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Could not read the file")
    } finally {
      setIsParsing(false)
      event.currentTarget.value = ""
    }
  }

  const openFilePicker = () => {
    if (isParsing || isImporting) return
    fileInputRef.current?.click()
  }

  const previewRows = useMemo(() => {
    return parseResult?.previewRows.slice(0, previewLimit) ?? []
  }, [parseResult])

  const handleImport = async () => {
    if (!parseResult || parseResult.importableRows.length === 0) return

    setIsImporting(true)
    setModalError(null)
    try {
      await onImport(parseResult.importableRows)
      onClose()
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div onClick={handleOverlayClick} className="modalWindowOverlay">
      <div className="modalWindow importModal" role="dialog" aria-modal="true">
        <div className="modalWindowContent">
          <div className="importModalTitle">Import blood pressure readings</div>
          <div className="importModalBody">
            Select a CSV file in format: <span><b>datetime, systolic, diastolic, comment</b></span>.
            <br/> The importer skips exact duplicates and
            rows that collide with an existing reading in the same minute.
          </div>

          <div className="importFilePicker">
            <input
              ref={fileInputRef}
              className="importFilePickerInput"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={isParsing || isImporting}
            />

            <button
              type="button"
              className={`importFilePseudoPicker${selectedFileName ? " active" : ""}`}
              onClick={openFilePicker}
              disabled={isParsing || isImporting}
            >
              {selectedFileName || "Choose CSV File"}
            </button>
          </div>

          {parseResult && (
            <div className="importSummary">
              <div>Rows: {parseResult.totalRows}</div>
              <div>Ready: {parseResult.importableRows.length}</div>
              <div>Duplicates: {parseResult.duplicateRows}</div>
              <div>Conflicts: {parseResult.conflictRows}</div>
              <div>Invalid: {parseResult.invalidRows}</div>
              <div>Delimiter: {JSON.stringify(parseResult.delimiter)}</div>
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="importPreview">
              <div className="importPreviewTable">
                {previewRows.map(row => (
                  <div key={`${row.lineNumber}-${row.status}`} className={`importPreviewRow importPreviewRow-${row.status}`}>
                    <div className="importPreviewCell importPreviewLine">Line {row.lineNumber}</div>
                    <div className="importPreviewCell importPreviewDate">
                      {row.reading ? row.reading.time.toLocaleString() : row.message}
                    </div>
                    <div className="importPreviewCell importPreviewValue">
                      {row.reading ? `${row.reading.sys} / ${row.reading.dia}` : row.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalError && <div className="modalError">{modalError}</div>}
        </div>

        <div className="modalWindowControls">
          <button onClick={onClose} disabled={isParsing || isImporting}>Close</button>
          <button type="button" onClick={handleImport} disabled={!parseResult || parseResult.importableRows.length === 0 || isParsing || isImporting}>
            {isImporting ? "Importing..." : `Import ${parseResult?.importableRows.length ?? 0}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportReadingsModal
