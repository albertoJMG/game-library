export interface RawGame {
  playniteId: string
  name: string
  sortingName?: string
  providerGameId?: string
  pluginId?: string
  sourceId?: string
  sourceName: string
  steamAppId?: number
  steamAppIdSource?: string
  steamAppIdConfidence?: string
  isInstalled: boolean
  hidden: boolean
  favorite: boolean
  platforms: string[]
  genres: string[]
  categories: string[]
  tags: string[]
  lastActivity?: string
  playtimeSeconds: number
  added?: string
  modified?: string
  releaseDate?: string
}

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

export interface CustomGameData {
  name: string
  sourceName: string
  genres: string[]
  playtimeSeconds: number
  releaseDate?: string
  isInstalled: boolean
  favorite: boolean
  hidden: boolean
}

export type PlatformName =
  | 'Steam'
  | 'Epic'
  | 'Amazon'
  | 'EA app'
  | 'Ubisoft Connect'
  | 'Battle.net'

export interface UserCategory {
  id: string
  name: string
  color: string
}

export interface UserNote {
  text: string
  updatedAt: string
}

export interface GameState {
  games: Game[]
  notes: Record<string, UserNote>
  categories: UserCategory[]
  gameCategories: Record<string, string[]>
  searchQuery: string
  selectedPlatforms: string[]
  selectedGenres: string[]
  selectedCategoryIds: string[]
  showFavoritesOnly: boolean
  showInstalledOnly: boolean
  sortField: 'name' | 'playtimeSeconds'
  sortDirection: 'asc' | 'desc'
  isLoaded: boolean
  selectedGame: Game | null
  sidebarOpen: boolean
}
