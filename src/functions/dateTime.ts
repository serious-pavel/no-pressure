const padTwoDigits = (value: number) => value.toString().padStart(2, "0")

export const getLocalDateInputValue = (date: Date) => {
  return [
    date.getFullYear(),
    padTwoDigits(date.getMonth() + 1),
    padTwoDigits(date.getDate()),
  ].join("-")
}

export const getLocalTimeInputValue = (date: Date) => {
  return [padTwoDigits(date.getHours()), padTwoDigits(date.getMinutes())].join(":")
}
