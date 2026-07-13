const PROXY_URL = 'http://localhost:3001/api/igdb/covers'

export async function fetchIgdbCovers(
  names: string[],
): Promise<Record<string, string>> {
  if (names.length === 0) return {}

  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names }),
    })

    if (!res.ok) {
      console.error(`IGDB proxy responded with ${res.status}`)
      return {}
    }

    return (await res.json()) as Record<string, string>
  } catch (err) {
    console.error('Error fetching IGDB covers:', err)
    return {}
  }
}
