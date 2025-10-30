export function parseStringToNumber(value: string | number): number {
  if (!value) return 0

  if (typeof value === 'number') return value

  const match = value.match(/\d+/)
  if (!match) return 0

  return parseInt(match[0], 10)
}