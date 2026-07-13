<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { Search, Gamepad2, Upload, Trash2, PanelLeftClose, PanelLeft, Plus } from '@lucide/vue'
import { ref, computed } from 'vue'
import type { RawGame } from '@/types'

const store = useGameStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const importMessage = ref('')
const importMessageType = ref<'success' | 'error'>('success')

const emit = defineEmits<{ addCustom: [] }>()

const formattedLastUpdated = computed(() => {
  if (!store.lastUpdated) return null
  const date = new Date(store.lastUpdated)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  processFile(file)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (!file) return
  processFile(file)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function processFile(file: File) {
  if (!file.name.endsWith('.json')) {
    showImportMessage('Por favor, selecciona un archivo JSON', 'error')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (!data.games || !Array.isArray(data.games)) {
        showImportMessage('El JSON no tiene el formato esperado (falta "games")', 'error')
        return
      }
      store.loadGames(data.games as RawGame[])
      showImportMessage(
        `Se cargaron ${data.games.length} juegos correctamente`,
        'success',
      )
    } catch {
      showImportMessage('Error al parsear el archivo JSON', 'error')
    }
  }
  reader.readAsText(file)
}

function showImportMessage(message: string, type: 'success' | 'error') {
  importMessage.value = message
  importMessageType.value = type
  setTimeout(() => {
    importMessage.value = ''
  }, 4000)
}

function confirmClear() {
  if (confirm('¿Estás seguro de que quieres borrar todos los datos? Se perderán los juegos, notas y categorías.')) {
    store.clearAllData()
    showImportMessage('Todos los datos han sido eliminados', 'success')
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md transition-colors"
    :class="isDragOver
      ? 'border-blue-500 bg-blue-500/10'
      : 'border-surface-200 bg-surface-50/80 dark:border-surface-800 dark:bg-surface-950/80'"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileImport"
    />

    <button
      @click="store.sidebarOpen = !store.sidebarOpen"
      class="rounded-lg p-2 transition-colors hover:bg-surface-200 dark:hover:bg-surface-800"
    >
      <PanelLeft v-if="store.sidebarOpen" class="h-5 w-5" />
      <PanelLeftClose v-else class="h-5 w-5" />
    </button>

    <div class="flex items-center gap-2">
      <Gamepad2 class="h-6 w-6 text-steam" />
      <h1 class="text-lg font-bold tracking-tight">Mi Librería</h1>
    </div>

    <div class="relative ml-4 flex-1 max-w-xl">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
      <input
        v-model="store.searchQuery"
        type="text"
        placeholder="Buscar juegos..."
        class="w-full rounded-lg border bg-surface-100 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
      />
    </div>

    <div class="ml-auto flex items-center gap-2">
      <Transition name="fade">
        <span
          v-if="importMessage"
          class="rounded-lg px-3 py-1.5 text-xs font-medium"
          :class="
            importMessageType === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          "
        >
          {{ importMessage }}
        </span>
      </Transition>

      <span
        v-if="store.isLoaded && formattedLastUpdated"
        class="hidden text-xs text-surface-400 lg:inline"
      >
        Actualizado: {{ formattedLastUpdated }}
      </span>

      <button
        v-if="store.isLoaded"
        @click="confirmClear"
        class="rounded-lg p-2 text-surface-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        title="Borrar todos los datos"
      >
        <Trash2 class="h-5 w-5" />
      </button>

      <button
        @click="emit('addCustom')"
        class="flex items-center gap-1.5 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
        title="Añadir juego personalizado"
      >
        <Plus class="h-4 w-4" />
        <span class="hidden sm:inline">Juego</span>
      </button>

      <button
        @click="triggerFileInput"
        class="flex items-center gap-2 rounded-lg bg-surface-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-surface-700 dark:bg-surface-200 dark:text-surface-900 dark:hover:bg-surface-300"
      >
        <Upload class="h-4 w-4" />
        <span class="hidden sm:inline">{{ store.isLoaded ? 'Actualizar' : 'Importar JSON' }}</span>
      </button>

      <ThemeToggle />
    </div>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
