<script setup lang="ts">
import type { Game } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { formatPlaytime, getSteamHeaderUrl } from '@/utils/formatters'
import { isLightColor } from '@/utils/platformColors'
import { Star, Gamepad2, EyeOff } from '@lucide/vue'
import { computed } from 'vue'

const props = defineProps<{ game: Game }>()
const store = useGameStore()

const hasSteamImage = computed(() => props.game.steamAppId != null)
const igdbCover = computed(() => store.getIgdbCover(props.game.name))

const noteCount = computed(() => {
  return store.getNote(props.game.playniteId) ? 1 : 0
})

const gameCatCount = computed(() => {
  return store.getGameCategories(props.game.playniteId).length
})

const platformBadgeStyle = computed(() => {
  const color = store.getPlatformColor(props.game.sourceName)
  const light = isLightColor(color)
  return {
    backgroundColor: color,
    color: light ? '#1e293b' : '#ffffff',
    textShadow: light ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
  }
})

function handleHide(event: Event) {
  event.stopPropagation()
  store.toggleHidden(props.game.playniteId)
}
</script>

<template>
  <div
    class="group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer dark:bg-surface-900"
    :style="{ borderColor: store.getPlatformColor(game.sourceName) }"
    @click="store.selectedGame = game"
  >
    <!-- Image -->
    <div class="relative aspect-[460/215] overflow-hidden bg-surface-100 dark:bg-surface-800">
      <img
        v-if="hasSteamImage"
        :src="getSteamHeaderUrl(game.steamAppId!)"
        :alt="game.name"
        class="h-full w-full object-cover"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <img
        v-else-if="igdbCover"
        :src="igdbCover"
        :alt="game.name"
        class="h-full w-full object-cover"
        loading="lazy"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <div v-else class="flex h-full w-full items-center justify-center">
        <Gamepad2 class="h-12 w-12 text-surface-300 dark:text-surface-600" />
      </div>

      <!-- Favorite badge -->
      <div
        v-if="game.favorite"
        class="absolute right-2 top-2 rounded-full bg-amber-500 p-1 text-white shadow-md"
      >
        <Star class="h-3 w-3" fill="currentColor" />
      </div>

      <!-- Hide button -->
      <button
        @click="handleHide"
        class="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white/70 opacity-0 shadow-md transition-all hover:bg-black/70 hover:text-white group-hover:opacity-100"
        :class="game.favorite ? 'top-9' : ''"
        title="Ocultar juego"
      >
        <EyeOff class="h-3 w-3" />
      </button>

      <!-- Hidden indicator -->
      <div
        v-if="game.hidden"
        class="absolute left-2 top-2 rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md"
      >
        OCULTO
      </div>

      <!-- Custom indicator -->
      <div
        v-if="game.isCustom"
        class="absolute left-2 top-2 rounded-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md"
        :class="game.hidden ? 'top-9' : ''"
      >
        PERSONALIZADO
      </div>

      <!-- Platform badge -->
      <div
        class="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold shadow-md"
        :style="platformBadgeStyle"
      >
        {{ game.sourceName }}
      </div>

      <!-- Installed indicator -->
      <div
        v-if="game.isInstalled"
        class="absolute bottom-2 right-2 rounded-md bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md"
      >
        INSTALADO
      </div>
    </div>

    <!-- Info -->
    <div class="flex flex-1 flex-col p-3">
      <h3 class="line-clamp-2 text-sm font-semibold leading-tight">{{ game.name }}</h3>

      <div class="mt-auto flex items-center justify-between pt-2">
        <span class="text-xs text-surface-500 dark:text-surface-400">
          {{ formatPlaytime(game.playtimeSeconds) }}
        </span>

        <div class="flex items-center gap-1">
          <span
            v-if="noteCount > 0"
            class="rounded bg-blue-100 px-1 py-0.5 text-[10px] text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          >
            📝
          </span>
          <span
            v-if="gameCatCount > 0"
            class="rounded bg-purple-100 px-1 py-0.5 text-[10px] text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          >
            {{ gameCatCount }}
          </span>
        </div>
      </div>

      <div v-if="game.genres.length > 0" class="mt-1.5 flex flex-wrap gap-1">
        <span
          v-for="genre in game.genres.slice(0, 3)"
          :key="genre"
          class="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-600 dark:bg-surface-800 dark:text-surface-400"
        >
          {{ genre }}
        </span>
        <span
          v-if="game.genres.length > 3"
          class="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-400 dark:bg-surface-800"
        >
          +{{ game.genres.length - 3 }}
        </span>
      </div>
    </div>
  </div>
</template>
