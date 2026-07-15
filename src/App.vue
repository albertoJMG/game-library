<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import TopPlayedSidebar from '@/components/layout/TopPlayedSidebar.vue'
import GameGrid from '@/components/games/GameGrid.vue'
import GameModal from '@/components/games/GameModal.vue'
import CustomGameModal from '@/components/games/CustomGameModal.vue'
import JsonDropZone from '@/components/library/JsonDropZone.vue'
import { useGameStore } from '@/stores/gameStore'
import { computed, ref, onMounted } from 'vue'
import { ArrowUp } from '@lucide/vue'
import type { Game } from '@/types'

const store = useGameStore()
onMounted(() => store.init())

const showLayout = computed(() => store.isLoaded)
const showScrollTop = ref(false)

const showCustomModal = ref(false)
const editingGame = ref<Game | null>(null)

function openAddCustom() {
  editingGame.value = null
  showCustomModal.value = true
}

function openEditCustom(game: Game) {
  editingGame.value = game
  showCustomModal.value = true
}

function closeCustomModal() {
  showCustomModal.value = false
  editingGame.value = null
}

function onGridScroll(y: number) {
  showScrollTop.value = y > 400
}

function scrollToTop() {
  const grid = document.getElementById('game-grid-scroll')
  grid?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="h-screen overflow-hidden transition-colors">
    <AppHeader @add-custom="openAddCustom" />

    <template v-if="showLayout">
      <div class="flex" style="height: calc(100vh - 60px)">
        <Transition name="slide-left">
          <div v-if="store.sidebarOpen" class="w-72 flex-shrink-0">
            <AppSidebar />
          </div>
        </Transition>
        <GameGrid @scroll="onGridScroll" />
        <TopPlayedSidebar />
      </div>
    </template>

    <template v-else>
      <JsonDropZone />
    </template>

    <GameModal @edit-custom="openEditCustom" />

    <CustomGameModal
      :show="showCustomModal"
      :game="editingGame"
      @close="closeCustomModal"
    />

    <!-- Scroll to top button -->
    <Transition name="fade-scale">
      <button
        v-if="showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-surface-800 text-white shadow-lg transition-colors hover:bg-surface-700 dark:bg-surface-200 dark:text-surface-900 dark:hover:bg-surface-300"
      >
        <ArrowUp class="h-5 w-5" />
      </button>
    </Transition>
  </div>
</template>

<style>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  margin-left: -288px;
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
