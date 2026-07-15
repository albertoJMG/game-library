import { Router } from 'express'
import { updateGame, deleteGame, addCustomGame, updateCustomGame, deleteCustomGame } from '../store.ts'
import type { Game } from '../store.ts'

const router = Router()

router.put('/:id', (req, res) => {
  const updated = updateGame(req.params.id, req.body)
  if (!updated) {
    res.status(404).json({ error: 'Game not found' })
    return
  }
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  const deleted = deleteGame(req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'Game not found' })
    return
  }
  res.status(204).send()
})

router.post('/custom', (req, res) => {
  const game: Game = {
    playniteId: req.body.playniteId ?? crypto.randomUUID(),
    name: req.body.name,
    sourceName: req.body.sourceName ?? 'Custom',
    platforms: req.body.platforms ?? ['PC (Windows)'],
    genres: req.body.genres ?? [],
    playtimeSeconds: req.body.playtimeSeconds ?? 0,
    releaseDate: req.body.releaseDate,
    isInstalled: req.body.isInstalled ?? false,
    favorite: req.body.favorite ?? false,
    hidden: req.body.hidden ?? false,
    isCustom: true,
  }
  res.status(201).json(addCustomGame(game))
})

router.put('/custom/:id', (req, res) => {
  const updated = updateCustomGame(req.params.id, req.body)
  if (!updated) {
    res.status(404).json({ error: 'Custom game not found' })
    return
  }
  res.json(updated)
})

router.delete('/custom/:id', (req, res) => {
  const deleted = deleteCustomGame(req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'Custom game not found' })
    return
  }
  res.status(204).send()
})

export default router
