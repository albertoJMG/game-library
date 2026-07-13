<script setup lang="ts">
import { ref } from 'vue'
import type { RawGame } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { Upload, FileJson, AlertCircle, Gamepad2 } from '@lucide/vue'

const store = useGameStore()
const isDragOver = ref(false)
const isLoading = ref(false)
const error = ref('')

function handleFile(file: File) {
  if (!file.name.endsWith('.json')) {
    error.value = 'Por favor, selecciona un archivo JSON'
    return
  }

  isLoading.value = true
  error.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (!data.games || !Array.isArray(data.games)) {
        error.value = 'El JSON no tiene el formato esperado (falta "games")'
        isLoading.value = false
        return
      }
      store.loadGames(data.games as RawGame[])
      isLoading.value = false
    } catch {
      error.value = 'Error al parsear el archivo JSON'
      isLoading.value = false
    }
  }
  reader.onerror = () => {
    error.value = 'Error al leer el archivo'
    isLoading.value = false
  }
  reader.readAsText(file)
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  input.value = ''
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-60px)] items-center justify-center p-8">
    <div class="w-full max-w-lg text-center">
      <Gamepad2 class="mx-auto mb-6 h-20 w-20 text-surface-300 dark:text-surface-600" />

      <h2 class="mb-2 text-2xl font-bold">Bienvenido a tu Librería</h2>
      <p class="mb-8 text-surface-500 dark:text-surface-400">
        Importa tu archivo JSON de Playnite para comenzar
      </p>

      <div
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        class="relative cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-all duration-200"
        :class="isDragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-surface-300 hover:border-surface-400 bg-surface-50 dark:border-surface-700 dark:hover:border-surface-600 dark:bg-surface-900'"
        @click="($refs.fileInput as HTMLInputElement).click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleInputChange"
        />

        <Upload
          v-if="!isLoading"
          class="mx-auto mb-4 h-12 w-12"
          :class="isDragOver ? 'text-blue-500' : 'text-surface-400'"
        />

        <div v-if="isLoading" class="flex flex-col items-center">
          <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-surface-200 border-t-blue-500" />
          <p class="text-sm text-surface-500">Procesando archivo...</p>
        </div>

        <template v-else>
          <p class="text-lg font-semibold">
            {{ isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu JSON aquí' }}
          </p>
          <p class="mt-2 text-sm text-surface-400">
            o haz clic para seleccionar un archivo
          </p>
          <div class="mt-4 flex items-center justify-center gap-2 text-xs text-surface-400">
            <FileJson class="h-4 w-4" />
            playnite-library.json
          </div>
        </template>
      </div>

      <Transition name="fade">
        <div
          v-if="error"
          class="mt-4 flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
        >
          <AlertCircle class="h-4 w-4" />
          {{ error }}
        </div>
      </Transition>
    </div>
  </div>
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
