import { Router } from 'express'
import { updatePlatformColors, updateIgdbCovers } from '../store.ts'

const router = Router()

router.put('/platform-colors', (req, res) => {
  const { colors } = req.body as { colors: Record<string, string> }
  if (!colors || typeof colors !== 'object') {
    res.status(400).json({ error: 'colors object required' })
    return
  }
  res.json(updatePlatformColors(colors))
})

router.put('/igdb-covers', (req, res) => {
  const { covers } = req.body as { covers: Record<string, string> }
  if (!covers || typeof covers !== 'object') {
    res.status(400).json({ error: 'covers object required' })
    return
  }
  res.json(updateIgdbCovers(covers))
})

export default router
