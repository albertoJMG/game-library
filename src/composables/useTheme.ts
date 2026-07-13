import { ref, watch, onMounted } from 'vue'

const isDark = ref(true)

export function useTheme() {
  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  onMounted(() => {
    const saved = localStorage.getItem('vg_theme')
    if (saved !== null) {
      isDark.value = saved === 'dark'
    }
    applyTheme()
  })

  watch(isDark, (val) => {
    localStorage.setItem('vg_theme', val ? 'dark' : 'light')
    applyTheme()
  })

  return { isDark, toggle }
}
