import { Router } from 'express'
import { getLibrary, updateGames } from '../store.ts'
import type { Game } from '../store.ts'

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
  const transformed = games.map((g) => ({
    ...g,
    isCustom: false,
  }))
  const data = updateGames(transformed)
  res.json(data)
})

export default router
