<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { getPlatformInitial } from '@/utils/platformColors'
import {
  Star,
  Download,
  ArrowUpDown,
  ArrowDownAZ,
  ArrowUpAZ,
  Clock,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Palette,
  EyeOff,
} from '@lucide/vue'
import { ref, computed } from 'vue'

const store = useGameStore()

const showPlatforms = ref(true)
const showGenres = ref(true)
const showCategories = ref(true)

const newCategoryName = ref('')
const newCategoryColor = ref('#6366f1')
const editingCategory = ref<string | null>(null)
const editCategoryName = ref('')
const editCategoryColor = ref('')

const editingPlatformColor = ref<string | null>(null)

const topGenreEntries = computed(() => {
  return Object.entries(store.genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
})

function handleAddCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  store.addCategory(name, newCategoryColor.value)
  newCategoryName.value = ''
}

function startEditCategory(cat: { id: string; name: string; color: string }) {
  editingCategory.value = cat.id
  editCategoryName.value = cat.name
  editCategoryColor.value = cat.color
}

function saveEditCategory() {
  if (!editingCategory.value) return
  store.updateCategory(editingCategory.value, editCategoryName.value, editCategoryColor.value)
  editingCategory.value = null
}

function cancelEditCategory() {
  editingCategory.value = null
}

function handlePlatformColorChange(platform: string, event: Event) {
  const input = event.target as HTMLInputElement
  store.setPlatformColor(platform, input.value)
}

function resetPlatformColor(platform: string) {
  const defaults: Record<string, string> = {
    Steam: '#1b2838',
    Epic: '#2F2F2F',
    Amazon: '#FF9900',
    'EA app': '#C40000',
    'Ubisoft Connect': '#005AA7',
    'Battle.net': '#1488DB',
  }
  const def = defaults[platform]
  if (def) store.setPlatformColor(platform, def)
}
</script>

<template>
  <aside
    class="flex h-full flex-col overflow-y-auto border-r border-surface-200 bg-surface-50 transition-colors dark:border-surface-800 dark:bg-surface-950"
  >
    <div class="flex-1 space-y-1 p-3">
      <!-- Quick Filters -->
      <div class="space-y-1 pb-3">
        <button
          @click="store.showFavoritesOnly = !store.showFavoritesOnly"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="store.showFavoritesOnly
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'text-surface-600 hover:bg-surface-200 dark:text-surface-400 dark:hover:bg-surface-800'"
        >
          <Star class="h-4 w-4" :fill="store.showFavoritesOnly ? 'currentColor' : 'none'" />
          Favoritos
        </button>
        <button
          @click="store.showInstalledOnly = !store.showInstalledOnly"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="store.showInstalledOnly
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'text-surface-600 hover:bg-surface-200 dark:text-surface-400 dark:hover:bg-surface-800'"
        >
          <Download class="h-4 w-4" />
          Instalados
        </button>
        <button
          @click="store.showHiddenOnly = !store.showHiddenOnly"
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="store.showHiddenOnly
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            : 'text-surface-600 hover:bg-surface-200 dark:text-surface-400 dark:hover:bg-surface-800'"
        >
          <EyeOff class="h-4 w-4" />
          Ocultos
        </button>
      </div>

      <!-- Sort -->
      <div class="pb-3">
        <h3 class="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
          <ArrowUpDown class="h-3.5 w-3.5" />
          Ordenar
        </h3>
        <div class="space-y-1">
          <button
            @click="store.sortField = 'name'; store.sortDirection = 'asc'"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            :class="store.sortField === 'name' && store.sortDirection === 'asc'
              ? 'bg-surface-200 font-medium dark:bg-surface-800'
              : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800/50'"
          >
            <ArrowDownAZ class="h-4 w-4" />
            A → Z
          </button>
          <button
            @click="store.sortField = 'name'; store.sortDirection = 'desc'"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            :class="store.sortField === 'name' && store.sortDirection === 'desc'
              ? 'bg-surface-200 font-medium dark:bg-surface-800'
              : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800/50'"
          >
            <ArrowUpAZ class="h-4 w-4" />
            Z → A
          </button>
          <button
            @click="store.sortField = 'playtimeSeconds'; store.sortDirection = 'desc'"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            :class="store.sortField === 'playtimeSeconds' && store.sortDirection === 'desc'
              ? 'bg-surface-200 font-medium dark:bg-surface-800'
              : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800/50'"
          >
            <Clock class="h-4 w-4" />
            Más jugados
          </button>
          <button
            @click="store.sortField = 'playtimeSeconds'; store.sortDirection = 'asc'"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
            :class="store.sortField === 'playtimeSeconds' && store.sortDirection === 'asc'
              ? 'bg-surface-200 font-medium dark:bg-surface-800'
              : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800/50'"
          >
            <Clock class="h-4 w-4" />
            Menos jugados
          </button>
        </div>
      </div>

      <!-- Platforms -->
      <div class="pb-3">
        <button
          @click="showPlatforms = !showPlatforms"
          class="flex w-full items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400"
        >
          <ChevronDown v-if="showPlatforms" class="h-3.5 w-3.5" />
          <ChevronRight v-else class="h-3.5 w-3.5" />
          Plataformas
        </button>
        <Transition name="expand">
          <div v-if="showPlatforms" class="mt-2 space-y-1">
            <div
              v-for="platform in store.allPlatforms"
              :key="platform"
              class="group"
            >
              <div class="flex items-center">
                <button
                  @click="
                    store.selectedPlatforms.includes(platform)
                      ? (store.selectedPlatforms = store.selectedPlatforms.filter((p) => p !== platform))
                      : store.selectedPlatforms.push(platform)
                  "
                  class="flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  :class="store.selectedPlatforms.includes(platform)
                    ? 'bg-surface-200 font-medium dark:bg-surface-800'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800/50'"
                >
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                    :style="{ backgroundColor: store.getPlatformColor(platform) }"
                  >
                    {{ getPlatformInitial(platform) }}
                  </span>
                  <span class="flex-1 text-left">{{ platform }}</span>
                  <span class="text-xs text-surface-400">{{ store.platformCounts[platform] }}</span>
                </button>
                <button
                  @click="editingPlatformColor = editingPlatformColor === platform ? null : platform"
                  class="ml-0.5 rounded p-1 text-surface-400 opacity-0 transition-all hover:text-surface-600 group-hover:opacity-100 dark:hover:text-surface-300"
                  :class="editingPlatformColor === platform ? '!opacity-100 text-surface-600 dark:text-surface-300' : ''"
                  title="Cambiar color"
                >
                  <Palette class="h-3.5 w-3.5" />
                </button>
              </div>
              <!-- Color picker row -->
              <Transition name="expand">
                <div
                  v-if="editingPlatformColor === platform"
                  class="flex items-center gap-2 rounded-lg bg-surface-100 px-3 py-1.5 dark:bg-surface-800"
                >
                  <input
                    type="color"
                    :value="store.getPlatformColor(platform)"
                    @input="handlePlatformColorChange(platform, $event)"
                    class="h-6 w-6 cursor-pointer rounded border-0"
                  />
                  <span class="text-xs text-surface-500">{{ store.getPlatformColor(platform) }}</span>
                  <button
                    @click="resetPlatformColor(platform)"
                    class="ml-auto text-[10px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                  >
                    Restablecer
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Genres -->
      <div class="pb-3">
        <button
          @click="showGenres = !showGenres"
          class="flex w-full items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400"
        >
          <ChevronDown v-if="showGenres" class="h-3.5 w-3.5" />
          <ChevronRight v-else class="h-3.5 w-3.5" />
          Géneros
        </button>
        <Transition name="expand">
          <div v-if="showGenres" class="mt-2 max-h-60 space-y-1 overflow-y-auto">
            <button
              v-for="[genre, count] in topGenreEntries"
              :key="genre"
              @click="
                store.selectedGenres.includes(genre)
                  ? (store.selectedGenres = store.selectedGenres.filter((g) => g !== genre))
                  : store.selectedGenres.push(genre)
              "
              class="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors"
              :class="store.selectedGenres.includes(genre)
                ? 'bg-surface-200 font-medium dark:bg-surface-800'
                : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800/50'"
            >
              <span class="truncate">{{ genre }}</span>
              <span class="ml-2 text-xs text-surface-400">{{ count }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- User Categories -->
      <div class="pb-3">
        <button
          @click="showCategories = !showCategories"
          class="flex w-full items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-surface-400"
        >
          <ChevronDown v-if="showCategories" class="h-3.5 w-3.5" />
          <ChevronRight v-else class="h-3.5 w-3.5" />
          <FolderOpen class="h-3.5 w-3.5" />
          Mis Categorías
        </button>
        <Transition name="expand">
          <div v-if="showCategories" class="mt-2 space-y-1">
            <div
              v-for="cat in store.categories"
              :key="cat.id"
              class="group"
            >
              <template v-if="editingCategory === cat.id">
                <div class="flex items-center gap-1 rounded-lg bg-surface-100 px-2 py-1 dark:bg-surface-800">
                  <input
                    v-model="editCategoryColor"
                    type="color"
                    class="h-6 w-6 cursor-pointer rounded border-0"
                  />
                  <input
                    v-model="editCategoryName"
                    class="flex-1 bg-transparent text-sm outline-none"
                    @keydown.enter="saveEditCategory"
                    @keydown.escape="cancelEditCategory"
                  />
                  <button @click="saveEditCategory" class="text-green-500 hover:text-green-400">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
                  </button>
                  <button @click="cancelEditCategory" class="text-surface-400 hover:text-surface-600">
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </template>
              <template v-else>
                <button
                  @click="
                    store.selectedCategoryIds.includes(cat.id)
                      ? (store.selectedCategoryIds = store.selectedCategoryIds.filter((id) => id !== cat.id))
                      : store.selectedCategoryIds.push(cat.id)
                  "
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
                  :class="store.selectedCategoryIds.includes(cat.id)
                    ? 'bg-surface-200 font-medium dark:bg-surface-800'
                    : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800/50'"
                >
                  <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: cat.color }" />
                  <span class="flex-1 truncate text-left">{{ cat.name }}</span>
                  <span
                    class="hidden rounded px-1 text-xs text-surface-400 hover:block group-hover:block"
                    @click.stop="startEditCategory(cat)"
                  >
                    ✎
                  </span>
                  <span
                    class="hidden rounded px-1 text-xs text-red-400 hover:block group-hover:block"
                    @click.stop="store.removeCategory(cat.id)"
                  >
                    ×
                  </span>
                </button>
              </template>
            </div>

            <!-- Add category -->
            <div class="flex items-center gap-1 px-2 py-1">
              <input
                v-model="newCategoryColor"
                type="color"
                class="h-6 w-6 cursor-pointer rounded border-0"
              />
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="Nueva categoría..."
                class="flex-1 rounded bg-transparent px-2 py-1 text-sm outline-none placeholder:text-surface-400"
                @keydown.enter="handleAddCategory"
              />
              <button
                @click="handleAddCategory"
                class="rounded p-1 text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-700"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Stats footer -->
    <div class="border-t border-surface-200 px-4 py-3 text-xs text-surface-400 dark:border-surface-800">
      {{ store.games.length }} juegos · {{ store.filteredGames.length }} mostrados
    </div>
  </aside>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
