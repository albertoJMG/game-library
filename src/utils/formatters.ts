export function formatPlaytime(seconds: number): string {
  if (seconds === 0) return 'Sin tiempo'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function formatReleaseDate(date: string | undefined): string {
  if (!date) return ''
  const parts = date.split('-')
  if (parts.length !== 3) return date
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  if (!year || !month || !day) return date
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

export function getSteamHeaderUrl(steamAppId: number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}
