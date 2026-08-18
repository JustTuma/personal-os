type ClassValue = string | number | boolean | undefined | null | Record<string, boolean | undefined | null> | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  function process(input: ClassValue) {
    if (!input && input !== 0) return
    if (typeof input === 'string') {
      classes.push(input)
    } else if (typeof input === 'number') {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      input.forEach(process)
    } else if (typeof input === 'object' && input !== null) {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }

  inputs.forEach(process)
  return classes.join(' ')
}
