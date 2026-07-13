<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { X, Plus, Trash2 } from '@lucide/vue'
import type { Game, CustomGameData } from '@/types'

const store = useGameStore()

const props = defineProps<{
  show: boolean
  game?: Game | null
}>()

const emit = defineEmits<{
  close: []
}>()

const isEditing = computed(() => props.game != null && props.game.isCustom)

const name = ref('')
const sourceName = ref('Custom')
const genresInput = ref('')
const playtimeMinutes = ref(0)
const releaseDate = ref('')
const isInstalled = ref(false)
const favorite = ref(false)
const hidden = ref(false)

watch(
  () => props.game,
  (g) => {
    if (g) {
      name.value = g.name
      sourceName.value = g.sourceName
      genresInput.value = g.genres.join(', ')
      playtimeMinutes.value = Math.round(g.playtimeSeconds / 60)
      releaseDate.value = g.releaseDate ?? ''
      isInstalled.value = g.isInstalled
      favorite.value = g.favorite
      hidden.value = g.hidden
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

function resetForm() {
  name.value = ''
  sourceName.value = 'Custom'
  genresInput.value = ''
  playtimeMinutes.value = 0
  releaseDate.value = ''
  isInstalled.value = false
  favorite.value = false
  hidden.value = false
}

const isValid = computed(() => name.value.trim().length > 0)

function getData(): CustomGameData {
  const genres = genresInput.value
    .split(',')
    .map((g) => g.trim())
    .filter((g) => g.length > 0)
  return {
    name: name.value.trim(),
    sourceName: sourceName.value.trim() || 'Custom',
    genres,
    playtimeSeconds: playtimeMinutes.value * 60,
    releaseDate: releaseDate.value || undefined,
    isInstalled: isInstalled.value,
    favorite: favorite.value,
    hidden: hidden.value,
  }
}

function handleSubmit() {
  if (!isValid.value) return
  if (isEditing.value && props.game) {
    store.updateCustomGame(props.game.playniteId, getData())
  } else {
    store.addCustomGame(getData())
  }
  emit('close')
}

function handleDelete() {
  if (props.game && confirm('¿Eliminar este juego personalizado?')) {
    store.deleteCustomGame(props.game.playniteId)
    if (store.selectedGame?.playniteId === props.game.playniteId) {
      store.selectedGame = null
    }
    emit('close')
  }
}

function handleBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
    emit('close')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
        tabindex="0"
        ref="($el) => ($el as HTMLElement)?.focus()"
      >
        <div
          class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-surface-900"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
            <h2 class="text-lg font-bold">
              {{ isEditing ? 'Editar juego' : 'Nuevo juego personalizado' }}
            </h2>
            <button
              @click="emit('close')"
              class="rounded-full p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4 p-5">
            <!-- Name -->
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-surface-400">
                Nombre *
              </label>
              <input
                v-model="name"
                type="text"
                required
                placeholder="Nombre del juego"
                class="w-full rounded-lg border bg-surface-50 px-3 py-2 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
              />
            </div>

            <!-- Platform -->
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-surface-400">
                Plataforma / Fuente
              </label>
              <input
                v-model="sourceName"
                type="text"
                placeholder="Custom"
                class="w-full rounded-lg border bg-surface-50 px-3 py-2 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
              />
            </div>

            <!-- Genres -->
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-surface-400">
                Géneros
              </label>
              <input
                v-model="genresInput"
                type="text"
                placeholder="Acción, Aventura, RPG (separados por coma)"
                class="w-full rounded-lg border bg-surface-50 px-3 py-2 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
              />
            </div>

            <!-- Playtime -->
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-surface-400">
                Tiempo de juego (minutos)
              </label>
              <input
                v-model.number="playtimeMinutes"
                type="number"
                min="0"
                class="w-full rounded-lg border bg-surface-50 px-3 py-2 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
              />
            </div>

            <!-- Release date -->
            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-surface-400">
                Fecha de lanzamiento
              </label>
              <input
                v-model="releaseDate"
                type="text"
                placeholder="AAAA-MM-DD"
                class="w-full rounded-lg border bg-surface-50 px-3 py-2 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
              />
            </div>

            <!-- Checkboxes -->
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="isInstalled" class="h-4 w-4 rounded border-surface-300 text-surface-600 focus:ring-surface-500" />
                Instalado
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="favorite" class="h-4 w-4 rounded border-surface-300 text-surface-600 focus:ring-surface-500" />
                Favorito
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="hidden" class="h-4 w-4 rounded border-surface-300 text-surface-600 focus:ring-surface-500" />
                Oculto
              </label>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 border-t border-surface-200 pt-4 dark:border-surface-800">
              <button
                v-if="isEditing"
                type="button"
                @click="handleDelete"
                class="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 class="h-4 w-4" />
                Eliminar
              </button>

              <div class="ml-auto flex gap-2">
                <button
                  type="button"
                  @click="emit('close')"
                  class="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="!isValid"
                  class="flex items-center gap-1.5 rounded-lg bg-surface-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-surface-700 disabled:opacity-40 dark:bg-surface-200 dark:text-surface-900 dark:hover:bg-surface-300"
                >
                  <Plus v-if="!isEditing" class="h-4 w-4" />
                  {{ isEditing ? 'Guardar cambios' : 'Añadir juego' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
