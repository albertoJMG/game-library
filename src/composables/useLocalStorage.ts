import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(load())

  function load(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(data.value))
    } catch (e) {
      console.error(`Error saving to localStorage key "${key}":`, e)
    }
  }

  watch(data, save, { deep: true })

  function remove() {
    localStorage.removeItem(key)
    data.value = defaultValue
  }

  return { data, remove }
}
