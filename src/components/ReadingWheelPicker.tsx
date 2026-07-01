import {type KeyboardEvent, useEffect, useId, useMemo, useRef} from "react"

interface ReadingWheelPickerProps {
  label: string
  value: string
  values: number[]
  disabled: boolean
  onChange: (value: string) => void
}

const ReadingWheelPicker = ({label, value, values, disabled, onChange}: ReadingWheelPickerProps) => {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const pickerId = useId()

  const selectedIndex = useMemo(() => {
    const index = values.findIndex(option => option.toString() === value)
    return index >= 0 ? index : 0
  }, [value, values])

  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex]
    selectedItem?.scrollIntoView({block: "center", inline: "nearest"})
  }, [selectedIndex])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    const moveSelection = (nextIndex: number) => {
      const clampedIndex = Math.min(Math.max(nextIndex, 0), values.length - 1)
      const nextValue = values[clampedIndex]?.toString()

      if (nextValue && nextValue !== value) {
        onChange(nextValue)
      }
    }

    switch (event.key) {
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault()
        moveSelection(selectedIndex - 1)
        break
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault()
        moveSelection(selectedIndex + 1)
        break
      case "Home":
        event.preventDefault()
        moveSelection(0)
        break
      case "End":
        event.preventDefault()
        moveSelection(values.length - 1)
        break
    }
  }

  const handleScroll = () => {
    if (disabled) return

    const container = listRef.current
    if (!container) return

    const containerCenter = container.scrollTop + container.clientHeight / 2
    let closestIndex = selectedIndex
    let smallestDistance = Number.POSITIVE_INFINITY

    itemRefs.current.forEach((item, index) => {
      if (!item) return
      const itemCenter = item.offsetTop + item.offsetHeight / 2
      const distance = Math.abs(itemCenter - containerCenter)

      if (distance < smallestDistance) {
        smallestDistance = distance
        closestIndex = index
      }
    })

    const nextValue = values[closestIndex]?.toString()
    if (nextValue && nextValue !== value) {
      onChange(nextValue)
    }
  }

  return (
    <div className="wheelPickerField" role="group" aria-label={label}>
      <div className="wheelPickerShadow" />
      <span className="wheelPickerLabelText">{label}</span>
      <div
        ref={listRef}
        className={`wheelPicker${disabled ? " disabled" : ""}`}
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-activedescendant={`${pickerId}-option-${selectedIndex}`}
        aria-orientation="vertical"
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        aria-label={label}
        aria-disabled={disabled}
      >
        <div className="wheelPickerSpacer" aria-hidden="true" />
        {values.map((option, index) => {
          const optionText = option.toString()
          const isActive = optionText === value

          return (
            <button
              key={option}
              id={`${pickerId}-option-${index}`}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              type="button"
              className={`wheelPickerItem${isActive ? " active" : ""}`}
              onClick={() => !disabled && onChange(optionText)}
              disabled={disabled}
              role="option"
              tabIndex={-1}
              aria-selected={isActive}
            >
              {optionText}
            </button>
          )
        })}
        <div className="wheelPickerSpacer" aria-hidden="true" />
      </div>
    </div>
  )
}

export default ReadingWheelPicker
