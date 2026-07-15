<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { formatPlaytime, formatReleaseDate, getSteamHeaderUrl } from '@/utils/formatters'
import { X, Star, Calendar, Clock, Gamepad2, Save, EyeOff, Eye, Pencil, Trash2 } from '@lucide/vue'
import { ref, watch, computed } from 'vue'

const store = useGameStore()
const noteText = ref('')
const isSaving = ref(false)

const emit = defineEmits<{
  editCustom: [game: import('@/types').Game]
}>()

const game = computed(() => store.selectedGame)

watch(
  () => store.selectedGame,
  (g) => {
    if (g) {
      noteText.value = store.getNote(g.playniteId)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

function close() {
  store.selectedGame = null
}

function saveNote() {
  if (!game.value) return
  isSaving.value = true
  store.saveNote(game.value.playniteId, noteText.value)
  setTimeout(() => {
    isSaving.value = false
  }, 600)
}

function handleBackdropClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

function toggleFavorite() {
  if (!game.value) return
  store.toggleFavorite(game.value.playniteId)
}

const gameCategories = computed(() => {
  if (!game.value) return []
  return store.getGameCategories(game.value.playniteId)
})

function toggleCategory(catId: string) {
  if (!game.value) return
  store.toggleGameCategory(game.value.playniteId, catId)
}

function handleToggleHidden() {
  if (!game.value) return
  store.toggleHidden(game.value.playniteId)
}

function handleEdit() {
  if (game.value) {
    emit('editCustom', game.value)
  }
}

function handleDelete() {
  if (game.value && confirm('¿Eliminar este juego personalizado?')) {
    store.deleteCustomGame(game.value.playniteId)
    store.selectedGame = null
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="game"
        class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
        tabindex="0"
        ref="($el) => ($el as HTMLElement)?.focus()"
      >
        <div
          class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-surface-900"
          @click.stop
        >
          <!-- Close button -->
          <button
            @click="close"
            class="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
          >
            <X class="h-5 w-5" />
          </button>

          <!-- Edit/Delete buttons for custom games -->
          <template v-if="game.isCustom">
            <button
              @click="handleEdit"
              class="absolute right-12 top-3 z-10 rounded-full bg-blue-500/80 p-1.5 text-white transition-colors hover:bg-blue-500"
              title="Editar juego"
            >
              <Pencil class="h-5 w-5" />
            </button>
            <button
              @click="handleDelete"
              class="absolute right-[5.5rem] top-3 z-10 rounded-full bg-red-500/80 p-1.5 text-white transition-colors hover:bg-red-500"
              title="Eliminar juego"
            >
              <Trash2 class="h-5 w-5" />
            </button>
          </template>

          <!-- Hide button -->
          <button
            @click="handleToggleHidden"
            class="absolute z-10 rounded-full p-1.5 text-white/70 transition-colors hover:text-white"
            :class="[
              game.hidden ? 'bg-orange-500/80 hover:bg-orange-500' : 'bg-black/50 hover:bg-black/70',
              game.isCustom ? 'top-3 right-[9rem]' : 'right-12 top-3',
            ]"
            :title="game.hidden ? 'Mostrar juego' : 'Ocultar juego'"
          >
            <Eye v-if="game.hidden" class="h-5 w-5" />
            <EyeOff v-else class="h-5 w-5" />
          </button>

          <!-- Header image -->
          <div class="relative aspect-[460/215] overflow-hidden">
            <img
              v-if="game.steamAppId"
              :src="getSteamHeaderUrl(game.steamAppId)"
              :alt="game.name"
              class="h-full w-full object-cover"
            />
            <img
              v-else-if="store.getIgdbCover(game.name)"
              :src="store.getIgdbCover(game.name)"
              :alt="game.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-surface-200 dark:bg-surface-800">
              <Gamepad2 class="h-20 w-20 text-surface-300 dark:text-surface-600" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div class="absolute bottom-4 left-4 right-4">
              <h2 class="text-2xl font-bold text-white drop-shadow-lg">{{ game.name }}</h2>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold text-white"
                  :style="{ backgroundColor: store.getPlatformColor(game.sourceName) }"
                >
                  {{ game.sourceName }}
                </span>
                <button
                  @click="toggleFavorite"
                  class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition-colors"
                  :class="game.favorite
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-surface-100 text-surface-400 hover:bg-surface-200 hover:text-amber-400 dark:bg-surface-700 dark:text-surface-500 dark:hover:bg-surface-600'"
                  :title="game.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
                >
                  <Star class="h-4 w-4" :fill="game.favorite ? 'currentColor' : 'none'" />
                  {{ game.favorite ? 'Favorito' : 'Favorito' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="space-y-5 p-5">
            <!-- Info grid -->
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div class="rounded-lg bg-surface-50 p-3 dark:bg-surface-800">
                <div class="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <Clock class="h-3.5 w-3.5" />
                  Tiempo de juego
                </div>
                <div class="mt-1 text-lg font-bold">{{ formatPlaytime(game.playtimeSeconds) }}</div>
              </div>
              <div class="rounded-lg bg-surface-50 p-3 dark:bg-surface-800">
                <div class="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <Calendar class="h-3.5 w-3.5" />
                  Lanzamiento
                </div>
                <div class="mt-1 text-lg font-bold">
                  {{ formatReleaseDate(game.releaseDate) || '—' }}
                </div>
              </div>
              <div class="rounded-lg bg-surface-50 p-3 dark:bg-surface-800">
                <div class="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <Gamepad2 class="h-3.5 w-3.5" />
                  Estado
                </div>
                <div class="mt-1 text-lg font-bold">
                  {{ game.isInstalled ? 'Instalado' : 'No instalado' }}
                </div>
              </div>
            </div>

            <!-- Genres -->
            <div v-if="game.genres.length > 0">
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
                Géneros
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="genre in game.genres"
                  :key="genre"
                  class="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700 dark:bg-surface-800 dark:text-surface-300"
                >
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- Categories -->
            <div>
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
                Categorías
              </h4>
              <div v-if="store.categories.length === 0" class="text-xs text-surface-400">
                Crea categorías en el panel lateral
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="cat in store.categories"
                  :key="cat.id"
                  @click="toggleCategory(cat.id)"
                  class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all"
                  :class="gameCategories.includes(cat.id)
                    ? 'border-transparent text-white'
                    : 'border-surface-200 text-surface-600 hover:border-surface-300 dark:border-surface-700 dark:text-surface-400'"
                  :style="gameCategories.includes(cat.id) ? { backgroundColor: cat.color } : {}"
                >
                  <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: cat.color }" />
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
                Notas
              </h4>
              <textarea
                v-model="noteText"
                placeholder="Escribe una nota sobre este juego..."
                rows="3"
                class="w-full resize-none rounded-lg border bg-surface-50 p-3 text-sm outline-none transition-colors focus:border-surface-400 focus:ring-2 focus:ring-surface-400/20 dark:border-surface-700 dark:bg-surface-800 dark:focus:border-surface-500"
              />
              <button
                @click="saveNote"
                class="mt-2 flex items-center gap-1.5 rounded-lg bg-surface-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-surface-700 dark:bg-surface-200 dark:text-surface-900 dark:hover:bg-surface-300"
              >
                <Save class="h-3.5 w-3.5" />
                {{ isSaving ? 'Guardado ✓' : 'Guardar nota' }}
              </button>
            </div>
          </div>
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
