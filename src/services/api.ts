import type { Game, UserCategory, UserNote } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
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

export const api = {
  getLibrary: () => request<LibraryData>('/library'),

  importGames: (games: Game[]) =>
    request<LibraryData>('/library/import', {
      method: 'POST',
      body: JSON.stringify({ games }),
    }),

  updateGame: (id: string, updates: Partial<Game>) =>
    request<Game>(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteGame: (id: string) =>
    request<void>(`/games/${id}`, { method: 'DELETE' }),

  addCustomGame: (game: Partial<Game>) =>
    request<Game>('/games/custom', {
      method: 'POST',
      body: JSON.stringify(game),
    }),

  updateCustomGame: (id: string, updates: Partial<Game>) =>
    request<Game>(`/games/custom/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteCustomGame: (id: string) =>
    request<void>(`/games/custom/${id}`, { method: 'DELETE' }),

  saveNote: (gameId: string, text: string) =>
    request<UserNote>(`/notes/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  deleteNote: (gameId: string) =>
    request<void>(`/notes/${gameId}`, { method: 'DELETE' }),

  getCategories: () => request<UserCategory[]>('/categories'),

  addCategory: (category: { name: string; color: string }) =>
    request<UserCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),

  updateCategory: (id: string, updates: Partial<UserCategory>) =>
    request<UserCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteCategory: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),

  updateGameCategories: (gameId: string, categoryIds: string[]) =>
    request<string[]>(`/categories/game/${gameId}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryIds }),
    }),

  updatePlatformColors: (colors: Record<string, string>) =>
    request<Record<string, string>>('/settings/platform-colors', {
      method: 'PUT',
      body: JSON.stringify({ colors }),
    }),

  updateIgdbCovers: (covers: Record<string, string>) =>
    request<Record<string, string>>('/settings/igdb-covers', {
      method: 'PUT',
      body: JSON.stringify({ covers }),
    }),
}
