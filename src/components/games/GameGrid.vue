<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import GameCard from './GameCard.vue'
import { computed, ref, watch } from 'vue'
import { PackageOpen } from '@lucide/vue'

const store = useGameStore()
const emit = defineEmits<{ scroll: [y: number] }>()
const PAGE_SIZE = 60
const currentPage = ref(1)
const scrollContainer = ref<HTMLElement | null>(null)

const visibleGames = computed(() => {
  return store.filteredGames.slice(0, currentPage.value * PAGE_SIZE)
})

const hasMore = computed(() => {
  return visibleGames.value.length < store.filteredGames.length
})

function loadMore() {
  currentPage.value++
}

watch(
  () => store.filteredGames.length,
  () => {
    currentPage.value = 1
  },
)

function handleScroll() {
  const el = scrollContainer.value
  if (!el) return
  emit('scroll', el.scrollTop)
  if (hasMore.value) {
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 400
    if (atBottom) loadMore()
  }
}
</script>

<template>
  <div
    id="game-grid-scroll"
    ref="scrollContainer"
    class="flex-1 overflow-y-auto p-4"
    @scroll="handleScroll"
  >
    <!-- Results count -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-surface-500 dark:text-surface-400">
        {{ store.filteredGames.length }}
        {{ store.filteredGames.length === 1 ? 'juego encontrado' : 'juegos encontrados' }}
      </p>
    </div>

    <!-- Empty state -->
    <div
      v-if="store.filteredGames.length === 0 && store.isLoaded"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <PackageOpen class="mb-4 h-16 w-16 text-surface-300 dark:text-surface-600" />
      <h3 class="text-lg font-semibold text-surface-600 dark:text-surface-400">
        No se encontraron juegos
      </h3>
      <p class="mt-1 text-sm text-surface-400">
        Prueba a cambiar los filtros o la búsqueda
      </p>
    </div>

    <!-- Game Grid -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <GameCard v-for="game in visibleGames" :key="game.playniteId" :game="game" />
    </div>

    <!-- Load more indicator -->
    <div v-if="hasMore" class="flex justify-center py-8">
      <button
        @click="loadMore"
        class="rounded-lg border border-surface-200 bg-white px-6 py-2 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
      >
        Cargar más ({{ store.filteredGames.length - visibleGames.length }} restantes)
      </button>
    </div>
  </div>
</template>
