import { Router } from 'express'
import { getLibrary, updateGames, writeData } from '../store.ts'
import type { Game, LibraryData } from '../store.ts'

const router = Router()

router.get('/', (_req, res) => {
  res.json(getLibrary())
})

router.post('/import', (req, res) => {
  const { games } = req.body as { games: Game[] }
  if (!Array.isArray(games)) {
    res.status(400).json({ error: 'games array required' })
    return
  }
  console.log(`[library] Importing ${games.length} games`)
  const transformed = games.map((g) => ({
    ...g,
    isCustom: false,
  }))
  const data = updateGames(transformed)
  console.log(`[library] Saved. Total games: ${data.games.length}`)
  res.json(data)
})

router.put('/', (req, res) => {
  const incoming = req.body
  if (!incoming || typeof incoming !== 'object') {
    res.status(400).json({ error: 'object required' })
    return
  }
  const current = getLibrary()
  const merged: LibraryData = {
    games: incoming.games ?? current.games,
    customGames: incoming.customGames ?? current.customGames,
    notes: incoming.notes ?? current.notes,
    categories: incoming.categories ?? current.categories,
    gameCategories: incoming.gameCategories ?? current.gameCategories,
    platformColors: incoming.platformColors ?? current.platformColors,
    igdbCovers: incoming.igdbCovers ?? current.igdbCovers,
    lastUpdated: new Date().toISOString(),
  }
  writeData(merged)
  res.json(merged)
})

export default router
