<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { Moon, Sun } from '@lucide/vue'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    @click="toggle"
    class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-surface-400 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
    :class="isDark ? 'bg-surface-700' : 'bg-surface-200'"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
  >
    <span
      class="inline-flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300"
      :class="isDark ? 'translate-x-8 bg-surface-900' : 'translate-x-1 bg-white'"
    >
      <Moon v-if="isDark" class="h-4 w-4 text-yellow-400" />
      <Sun v-else class="h-4 w-4 text-amber-500" />
    </span>
  </button>
</template>
