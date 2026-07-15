import { Router } from 'express'
import { addCategory, updateCategory, removeCategory, updateGameCategories, getLibrary } from '../store.ts'
import type { UserCategory } from '../store.ts'

const router = Router()

router.get('/', (_req, res) => {
  const { categories } = getLibrary()
  res.json(categories)
})

router.post('/', (req, res) => {
  const category: UserCategory = {
    id: crypto.randomUUID(),
    name: req.body.name,
    color: req.body.color,
  }
  res.status(201).json(addCategory(category))
})

router.put('/:id', (req, res) => {
  const updated = updateCategory(req.params.id, req.body)
  if (!updated) {
    res.status(404).json({ error: 'Category not found' })
    return
  }
  res.json(updated)
})

router.delete('/:id', (req, res) => {
  const deleted = removeCategory(req.params.id)
  if (!deleted) {
    res.status(404).json({ error: 'Category not found' })
    return
  }
  res.status(204).send()
})

router.put('/game/:gameId', (req, res) => {
  const { categoryIds } = req.body as { categoryIds: string[] }
  if (!Array.isArray(categoryIds)) {
    res.status(400).json({ error: 'categoryIds array required' })
    return
  }
  res.json(updateGameCategories(req.params.gameId, categoryIds))
})

export default router
