export const debounce = (func: (val: string) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (val: string) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(val), delay)
    console.log(timeoutId)
  }
}
