export function getPlatformInitial(sourceName: string): string {
  const initials: Record<string, string> = {
    Steam: 'S',
    Epic: 'E',
    Amazon: 'A',
    'EA app': 'EA',
    'Ubisoft Connect': 'U',
    'Battle.net': 'B',
  }
  return initials[sourceName] ?? sourceName.charAt(0)
}

export function isLightColor(hex: string): boolean {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
