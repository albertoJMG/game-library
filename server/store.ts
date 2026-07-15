import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data', 'library.json')

export interface Game {
  playniteId: string
  name: string
  sortingName?: string
  sourceName: string
  steamAppId?: number
  platforms: string[]
  genres: string[]
  playtimeSeconds: number
  lastActivity?: string
  releaseDate?: string
  isInstalled: boolean
  favorite: boolean
  hidden: boolean
  isCustom: boolean
}

export interface UserNote {
  text: string
  updatedAt: string
}

export interface UserCategory {
  id: string
  name: string
  color: string
}

export interface LibraryData {
  games: Game[]
  customGames: Game[]
  notes: Record<string, UserNote>
  categories: UserCategory[]
  gameCategories: Record<string, string[]>
  platformColors: Record<string, string>
  igdbCovers: Record<string, string>
  lastUpdated: string | null
}

const EMPTY_DATA: LibraryData = {
  games: [],
  customGames: [],
  notes: {},
  categories: [],
  gameCategories: {},
  platformColors: {},
  igdbCovers: {},
  lastUpdated: null,
}

function readData(): LibraryData {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { ...EMPTY_DATA }
  }
}

export function writeData(data: LibraryData): void {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export function getLibrary(): LibraryData {
  return readData()
}

export function updateGames(games: Game[]) {
  const data = readData()
  data.games = games
  data.lastUpdated = new Date().toISOString()
  writeData(data)
  return data
}

export function updateGame(id: string, updates: Partial<Game>) {
  const data = readData()
  const game = data.games.find((g) => g.playniteId === id)
  if (!game) {
    const custom = data.customGames.find((g) => g.playniteId === id)
    if (!custom) return null
    Object.assign(custom, updates)
    writeData(data)
    return custom
  }
  Object.assign(game, updates)
  writeData(data)
  return game
}

export function deleteGame(id: string) {
  const data = readData()
  const idx = data.games.findIndex((g) => g.playniteId === id)
  if (idx !== -1) {
    data.games.splice(idx, 1)
    delete data.notes[id]
    delete data.gameCategories[id]
    writeData(data)
    return true
  }
  const cIdx = data.customGames.findIndex((g) => g.playniteId === id)
  if (cIdx !== -1) {
    data.customGames.splice(cIdx, 1)
    delete data.notes[id]
    delete data.gameCategories[id]
    writeData(data)
    return true
  }
  return false
}

export function addCustomGame(game: Game) {
  const data = readData()
  data.customGames.push(game)
  writeData(data)
  return game
}

export function updateCustomGame(id: string, updates: Partial<Game>) {
  const data = readData()
  const game = data.customGames.find((g) => g.playniteId === id)
  if (!game) return null
  Object.assign(game, updates)
  writeData(data)
  return game
}

export function deleteCustomGame(id: string) {
  const data = readData()
  const idx = data.customGames.findIndex((g) => g.playniteId === id)
  if (idx === -1) return false
  data.customGames.splice(idx, 1)
  delete data.notes[id]
  delete data.gameCategories[id]
  writeData(data)
  return true
}

export function saveNote(gameId: string, note: UserNote) {
  const data = readData()
  data.notes[gameId] = note
  writeData(data)
  return note
}

export function deleteNote(gameId: string) {
  const data = readData()
  delete data.notes[gameId]
  writeData(data)
}

export function addCategory(category: UserCategory) {
  const data = readData()
  data.categories.push(category)
  writeData(data)
  return category
}

export function updateCategory(id: string, updates: Partial<UserCategory>) {
  const data = readData()
  const cat = data.categories.find((c) => c.id === id)
  if (!cat) return null
  Object.assign(cat, updates)
  writeData(data)
  return cat
}

export function removeCategory(id: string) {
  const data = readData()
  const idx = data.categories.findIndex((c) => c.id === id)
  if (idx === -1) return false
  data.categories.splice(idx, 1)
  for (const gameId of Object.keys(data.gameCategories)) {
    data.gameCategories[gameId] = data.gameCategories[gameId].filter((cId) => cId !== id)
  }
  writeData(data)
  return true
}

export function updateGameCategories(gameId: string, categoryIds: string[]) {
  const data = readData()
  data.gameCategories[gameId] = categoryIds
  writeData(data)
  return categoryIds
}

export function updatePlatformColors(colors: Record<string, string>) {
  const data = readData()
  data.platformColors = colors
  writeData(data)
  return colors
}

export function updateIgdbCovers(covers: Record<string, string>) {
  const data = readData()
  data.igdbCovers = { ...data.igdbCovers, ...covers }
  writeData(data)
  return data.igdbCovers
}
