<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { formatPlaytime, getSteamHeaderUrl } from '@/utils/formatters'
import { Trophy, Gamepad2 } from '@lucide/vue'

const store = useGameStore()
</script>

<template>
  <aside
    class="flex h-full w-72 flex-shrink-0 flex-col overflow-y-auto border-l border-surface-200 bg-surface-50 transition-colors dark:border-surface-800 dark:bg-surface-950"
  >
    <div class="p-4">
      <h2 class="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
        <Trophy class="h-4 w-4 text-amber-500" />
        Top 5 Más Jugados
      </h2>

      <div v-if="store.topPlayed.length === 0" class="py-8 text-center text-xs text-surface-400">
        <Gamepad2 class="mx-auto mb-2 h-8 w-8 opacity-40" />
        Sin datos de juego
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(game, index) in store.topPlayed"
          :key="game.playniteId"
          class="group cursor-pointer overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-surface-900"
          :style="{ borderColor: store.getPlatformColor(game.sourceName) }"
          @click="store.selectedGame = game"
        >
          <!-- Image -->
          <div class="relative aspect-[460/215] overflow-hidden bg-surface-100 dark:bg-surface-800">
            <img
              v-if="game.steamAppId"
              :src="getSteamHeaderUrl(game.steamAppId)"
              :alt="game.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <img
              v-else-if="store.getIgdbCover(game.name)"
              :src="store.getIgdbCover(game.name)"
              :alt="game.name"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Gamepad2 class="h-10 w-10 text-surface-300 dark:text-surface-600" />
            </div>

            <!-- Rank badge -->
            <div
              class="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
              :class="
                index === 0 ? 'bg-amber-500' :
                index === 1 ? 'bg-surface-400' :
                index === 2 ? 'bg-amber-700' :
                'bg-surface-600'
              "
            >
              {{ index + 1 }}
            </div>

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <!-- Playtime at bottom -->
            <div class="absolute bottom-2 left-2 right-2">
              <div class="text-sm font-bold text-white drop-shadow-md">
                {{ formatPlaytime(game.playtimeSeconds) }}
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="p-2.5">
            <h3 class="line-clamp-1 text-xs font-semibold">{{ game.name }}</h3>
            <div class="mt-1 flex items-center gap-1.5">
              <span
                class="inline-block h-1.5 rounded-full"
                :style="{
                  backgroundColor: store.getPlatformColor(game.sourceName),
                  width: `${Math.max(8, (game.playtimeSeconds / store.topPlayed[0]!.playtimeSeconds) * 60)}px`,
                }"
              />
              <span class="text-[10px] text-surface-400">{{ game.sourceName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
