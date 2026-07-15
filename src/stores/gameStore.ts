import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Game, RawGame, UserCategory, UserNote, CustomGameData } from '@/types'
import { fetchIgdbCovers } from '@/services/igdb'

const STORAGE_KEY_GAMES = 'vg_games'
const STORAGE_KEY_NOTES = 'vg_notes'
const STORAGE_KEY_CATEGORIES = 'vg_categories'
const STORAGE_KEY_GAME_CATEGORIES = 'vg_game_categories'
const STORAGE_KEY_PLATFORM_COLORS = 'vg_platform_colors'
const STORAGE_KEY_IGDB_COVERS = 'vg_igdb_covers'
const STORAGE_KEY_CUSTOM_GAMES = 'vg_custom_games'
const STORAGE_KEY_LAST_UPDATED = 'vg_last_updated'

const DEFAULT_PLATFORM_COLORS: Record<string, string> = {
  Steam: '#1b2838',
  Epic: '#2F2F2F',
  Amazon: '#FF9900',
  'EA app': '#C40000',
  'Ubisoft Connect': '#005AA7',
  'Battle.net': '#1488DB',
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Error saving ${key}:`, e)
  }
}

function transformGame(raw: RawGame): Game {
  return {
    playniteId: raw.playniteId,
    name: raw.name,
    sortingName: raw.sortingName,
    sourceName: raw.sourceName,
    steamAppId: raw.steamAppId,
    platforms: raw.platforms,
    genres: raw.genres,
    playtimeSeconds: raw.playtimeSeconds,
    lastActivity: raw.lastActivity,
    releaseDate: raw.releaseDate,
    isInstalled: raw.isInstalled,
    favorite: raw.favorite,
    hidden: raw.hidden,
    isCustom: false,
  }
}

export const useGameStore = defineStore('games', () => {
  const games = ref<Game[]>(loadJson(STORAGE_KEY_GAMES, []))
  const notes = ref<Record<string, UserNote>>(loadJson(STORAGE_KEY_NOTES, {}))
  const categories = ref<UserCategory[]>(loadJson(STORAGE_KEY_CATEGORIES, []))
  const gameCategories = ref<Record<string, string[]>>(
    loadJson(STORAGE_KEY_GAME_CATEGORIES, {}),
  )
  const platformColors = ref<Record<string, string>>(
    loadJson(STORAGE_KEY_PLATFORM_COLORS, { ...DEFAULT_PLATFORM_COLORS }),
  )
  const igdbCovers = ref<Record<string, string>>(loadJson(STORAGE_KEY_IGDB_COVERS, {}))
  const customGames = ref<Game[]>(loadJson(STORAGE_KEY_CUSTOM_GAMES, []))
  const lastUpdated = ref<string | null>(loadJson<string | null>(STORAGE_KEY_LAST_UPDATED, null))

  const searchQuery = ref('')
  const selectedPlatforms = ref<string[]>([])
  const selectedGenres = ref<string[]>([])
  const selectedCategoryIds = ref<string[]>([])
  const showFavoritesOnly = ref(false)
  const showInstalledOnly = ref(false)
  const showHiddenOnly = ref(false)
  const sortField = ref<'name' | 'playtimeSeconds'>('name')
  const sortDirection = ref<'asc' | 'desc'>('asc')
  const selectedGame = ref<Game | null>(null)
  const sidebarOpen = ref(true)

  const isLoaded = computed(() => games.value.length > 0 || customGames.value.length > 0)

  const allGames = computed(() => [...games.value, ...customGames.value])

  const allGenres = computed(() => {
    const genreSet = new Set<string>()
    for (const game of allGames.value) {
      for (const genre of game.genres) {
        genreSet.add(genre)
      }
    }
    return Array.from(genreSet).sort()
  })

  const allPlatforms = computed(() => {
    const platformSet = new Set<string>()
    for (const game of allGames.value) {
      platformSet.add(game.sourceName)
    }
    return Array.from(platformSet).sort()
  })

  const filteredGames = computed(() => {
    let result = allGames.value

    if (!showHiddenOnly.value) {
      result = result.filter((g) => !g.hidden)
    } else {
      result = result.filter((g) => g.hidden)
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.sortingName?.toLowerCase().includes(q) ?? false),
      )
    }

    if (selectedPlatforms.value.length > 0) {
      result = result.filter((g) => selectedPlatforms.value.includes(g.sourceName))
    }

    if (selectedGenres.value.length > 0) {
      result = result.filter((g) =>
        g.genres.some((genre) => selectedGenres.value.includes(genre)),
      )
    }

    if (selectedCategoryIds.value.length > 0) {
      result = result.filter((g) => {
        const gameCatIds = gameCategories.value[g.playniteId] ?? []
        return selectedCategoryIds.value.some((catId) => gameCatIds.includes(catId))
      })
    }

    if (showFavoritesOnly.value) {
      result = result.filter((g) => g.favorite)
    }

    if (showInstalledOnly.value) {
      result = result.filter((g) => g.isInstalled)
    }

    const sorted = [...result]
    sorted.sort((a, b) => {
      if (sortField.value === 'name') {
        const nameA = (a.sortingName ?? a.name).toLowerCase()
        const nameB = (b.sortingName ?? b.name).toLowerCase()
        const cmp = nameA.localeCompare(nameB, 'es')
        return sortDirection.value === 'asc' ? cmp : -cmp
      }
      const cmp = a.playtimeSeconds - b.playtimeSeconds
      return sortDirection.value === 'asc' ? cmp : -cmp
    })

    return sorted
  })

  const topPlayed = computed(() => {
    return [...allGames.value]
      .filter((g) => g.playtimeSeconds > 0)
      .sort((a, b) => b.playtimeSeconds - a.playtimeSeconds)
      .slice(0, 5)
  })

  const platformCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const game of allGames.value) {
      counts[game.sourceName] = (counts[game.sourceName] ?? 0) + 1
    }
    return counts
  })

  const genreCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const game of allGames.value) {
      for (const genre of game.genres) {
        counts[genre] = (counts[genre] ?? 0) + 1
      }
    }
    return counts
  })

  function loadGames(rawGames: RawGame[]) {
    games.value = rawGames.map(transformGame)
    saveJson(STORAGE_KEY_GAMES, games.value)
    lastUpdated.value = new Date().toISOString()
    saveJson(STORAGE_KEY_LAST_UPDATED, lastUpdated.value)
    fetchMissingCovers()
  }

  function toggleHidden(gameId: string) {
    const game = allGames.value.find((g) => g.playniteId === gameId)
    if (game) {
      game.hidden = !game.hidden
      if (game.isCustom) {
        saveJson(STORAGE_KEY_CUSTOM_GAMES, customGames.value)
      } else {
        saveJson(STORAGE_KEY_GAMES, games.value)
      }
    }
  }

  function toggleFavorite(gameId: string) {
    const game = allGames.value.find((g) => g.playniteId === gameId)
    if (game) {
      game.favorite = !game.favorite
      if (game.isCustom) {
        saveJson(STORAGE_KEY_CUSTOM_GAMES, customGames.value)
      } else {
        saveJson(STORAGE_KEY_GAMES, games.value)
      }
    }
  }

  function addCustomGame(data: CustomGameData): Game {
    const game: Game = {
      playniteId: crypto.randomUUID(),
      name: data.name,
      sourceName: data.sourceName,
      platforms: ['PC (Windows)'],
      genres: data.genres,
      playtimeSeconds: data.playtimeSeconds,
      releaseDate: data.releaseDate,
      isInstalled: data.isInstalled,
      favorite: data.favorite,
      hidden: data.hidden,
      isCustom: true,
    }
    customGames.value.push(game)
    saveJson(STORAGE_KEY_CUSTOM_GAMES, customGames.value)
    return game
  }

  function updateCustomGame(gameId: string, data: CustomGameData) {
    const game = customGames.value.find((g) => g.playniteId === gameId)
    if (game) {
      game.name = data.name
      game.sourceName = data.sourceName
      game.genres = data.genres
      game.playtimeSeconds = data.playtimeSeconds
      game.releaseDate = data.releaseDate
      game.isInstalled = data.isInstalled
      game.favorite = data.favorite
      game.hidden = data.hidden
      saveJson(STORAGE_KEY_CUSTOM_GAMES, customGames.value)
    }
  }

  function deleteCustomGame(gameId: string) {
    customGames.value = customGames.value.filter((g) => g.playniteId !== gameId)
    saveJson(STORAGE_KEY_CUSTOM_GAMES, customGames.value)
    delete notes.value[gameId]
    saveJson(STORAGE_KEY_NOTES, notes.value)
    delete gameCategories.value[gameId]
    saveJson(STORAGE_KEY_GAME_CATEGORIES, gameCategories.value)
  }

  function saveNote(gameId: string, text: string) {
    notes.value[gameId] = {
      text,
      updatedAt: new Date().toISOString(),
    }
    saveJson(STORAGE_KEY_NOTES, notes.value)
  }

  function getNote(gameId: string): string {
    return notes.value[gameId]?.text ?? ''
  }

  function addCategory(name: string, color: string): UserCategory {
    const cat: UserCategory = {
      id: crypto.randomUUID(),
      name,
      color,
    }
    categories.value.push(cat)
    saveJson(STORAGE_KEY_CATEGORIES, categories.value)
    return cat
  }

  function updateCategory(id: string, name: string, color: string) {
    const cat = categories.value.find((c) => c.id === id)
    if (cat) {
      cat.name = name
      cat.color = color
      saveJson(STORAGE_KEY_CATEGORIES, categories.value)
    }
  }

  function removeCategory(id: string) {
    categories.value = categories.value.filter((c) => c.id !== id)
    saveJson(STORAGE_KEY_CATEGORIES, categories.value)

    for (const gameId of Object.keys(gameCategories.value)) {
      const cats = gameCategories.value[gameId]
      if (cats) {
        gameCategories.value[gameId] = cats.filter((catId) => catId !== id)
      }
    }
    saveJson(STORAGE_KEY_GAME_CATEGORIES, gameCategories.value)
  }

  function toggleGameCategory(gameId: string, categoryId: string) {
    if (!gameCategories.value[gameId]) {
      gameCategories.value[gameId] = []
    }
    const idx = gameCategories.value[gameId].indexOf(categoryId)
    if (idx === -1) {
      gameCategories.value[gameId].push(categoryId)
    } else {
      gameCategories.value[gameId].splice(idx, 1)
    }
    saveJson(STORAGE_KEY_GAME_CATEGORIES, gameCategories.value)
  }

  function getGameCategories(gameId: string): string[] {
    return gameCategories.value[gameId] ?? []
  }

  function getPlatformColor(sourceName: string): string {
    return platformColors.value[sourceName] ?? '#64748b'
  }

  function setPlatformColor(sourceName: string, color: string) {
    platformColors.value[sourceName] = color
    saveJson(STORAGE_KEY_PLATFORM_COLORS, platformColors.value)
  }

  function getIgdbCover(gameName: string): string | undefined {
    const url = igdbCovers.value[gameName]
    return url && url !== '' ? url : undefined
  }

  async function fetchMissingCovers() {
    const BATCH_SIZE = 20
    const namesToFetch: string[] = []

    for (const game of games.value) {
      if (game.steamAppId) continue
      if (igdbCovers.value[game.name] !== undefined) continue
      if (!namesToFetch.includes(game.name)) {
        namesToFetch.push(game.name)
      }
    }

    for (let i = 0; i < namesToFetch.length; i += BATCH_SIZE) {
      const batch = namesToFetch.slice(i, i + BATCH_SIZE)
      const covers = await fetchIgdbCovers(batch)
      for (const [name, url] of Object.entries(covers)) {
        igdbCovers.value[name] = url
      }
    }

    saveJson(STORAGE_KEY_IGDB_COVERS, igdbCovers.value)
  }

  function clearAllData() {
    games.value = []
    customGames.value = []
    notes.value = {}
    categories.value = []
    gameCategories.value = {}
    searchQuery.value = ''
    selectedPlatforms.value = []
    selectedGenres.value = []
    selectedCategoryIds.value = []
    showFavoritesOnly.value = false
    showInstalledOnly.value = false
    showHiddenOnly.value = false
    lastUpdated.value = null
    localStorage.removeItem(STORAGE_KEY_GAMES)
    localStorage.removeItem(STORAGE_KEY_CUSTOM_GAMES)
    localStorage.removeItem(STORAGE_KEY_NOTES)
    localStorage.removeItem(STORAGE_KEY_CATEGORIES)
    localStorage.removeItem(STORAGE_KEY_GAME_CATEGORIES)
    localStorage.removeItem(STORAGE_KEY_PLATFORM_COLORS)
    localStorage.removeItem(STORAGE_KEY_IGDB_COVERS)
    localStorage.removeItem(STORAGE_KEY_LAST_UPDATED)
    platformColors.value = { ...DEFAULT_PLATFORM_COLORS }
    igdbCovers.value = {}
  }

  if (games.value.length > 0) {
    fetchMissingCovers()
  }

  return {
    games,
    customGames,
    lastUpdated,
    notes,
    categories,
    gameCategories,
    searchQuery,
    selectedPlatforms,
    selectedGenres,
    selectedCategoryIds,
    showFavoritesOnly,
    showInstalledOnly,
    showHiddenOnly,
    sortField,
    sortDirection,
    selectedGame,
    sidebarOpen,
    isLoaded,
    allGames,
    allGenres,
    allPlatforms,
    filteredGames,
    topPlayed,
    platformCounts,
    genreCounts,
    loadGames,
    toggleHidden,
    toggleFavorite,
    addCustomGame,
    updateCustomGame,
    deleteCustomGame,
    saveNote,
    getNote,
    addCategory,
    updateCategory,
    removeCategory,
    toggleGameCategory,
    getGameCategories,
    getPlatformColor,
    setPlatformColor,
    platformColors,
    getIgdbCover,
    fetchMissingCovers,
    clearAllData,
  }
})
