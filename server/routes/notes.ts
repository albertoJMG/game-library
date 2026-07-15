import { Router } from 'express'
import { saveNote, deleteNote } from '../store.ts'
import type { UserNote } from '../store.ts'

const router = Router()

router.put('/:gameId', (req, res) => {
  const note: UserNote = {
    text: req.body.text ?? '',
    updatedAt: new Date().toISOString(),
  }
  res.json(saveNote(req.params.gameId, note))
})

router.delete('/:gameId', (req, res) => {
  deleteNote(req.params.gameId)
  res.status(204).send()
})

export default router
