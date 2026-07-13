import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const CLIENT_ID = process.env.IGDB_CLIENT_ID
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET in .env')
  process.exit(1)
}

let accessToken: string | null = null
let tokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken
  }

  const res = await fetch(
    'https://id.twitch.tv/oauth2/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        grant_type: 'client_credentials',
      }),
    },
  )

  if (!res.ok) {
    throw new Error(`Twitch OAuth failed: ${res.status}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  accessToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000
  return accessToken
}

const coverCache = new Map<string, string>()

async function searchCovers(names: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const namesToFetch: string[] = []

  for (const name of names) {
    const cached = coverCache.get(name)
    if (cached) {
      result[name] = cached
    } else {
      namesToFetch.push(name)
    }
  }

  if (namesToFetch.length === 0) return result

  const token = await getAccessToken()

  for (const name of namesToFetch) {
    try {
      const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': CLIENT_ID!,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
          'Accept': 'application/json',
        },
        body: `search "${name.replace(/"/g, '\\"')}"; fields name,cover.image_id; limit 1;`,
      })

      if (!res.ok) {
        console.error(`IGDB search failed for "${name}": ${res.status}`)
        continue
      }

      const games = (await res.json()) as Array<{
        name: string
        cover?: { image_id: string }
      }>

      if (games.length > 0 && games[0]?.cover?.image_id) {
        const url = `https://images.igdb.com/igdb/image/upload/t_cover_big/${games[0].cover.image_id}.jpg`
        coverCache.set(name, url)
        result[name] = url
      } else {
        coverCache.set(name, '')
      }
    } catch (err) {
      console.error(`Error fetching cover for "${name}":`, err)
    }
  }

  return result
}

app.post('/api/igdb/covers', async (req, res) => {
  try {
    const { names } = req.body as { names: string[] }
    if (!Array.isArray(names) || names.length === 0) {
      res.status(400).json({ error: 'names array required' })
      return
    }

    const covers = await searchCovers(names)
    res.json(covers)
  } catch (err) {
    console.error('IGDB proxy error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/igdb/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`IGDB proxy running on http://localhost:${PORT}`)
})
