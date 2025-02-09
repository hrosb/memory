import { ref, computed } from 'vue'
import en from '../locales/en.json'
import nb from '../locales/nb.json'

const translations = { en, nb }

export function useI18n() {
  const currentLocale = ref('en') // Default to 'en'

  // Only access localStorage on client side
  if (process.client) {
    const stored = localStorage.getItem('locale')
    if (stored) {
      currentLocale.value = stored
    }
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let value = translations[currentLocale.value]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      }
    }
    
    return value || key
  }

  const setLocale = (locale: string) => {
    console.log('Setting locale to:', locale); // Add debugging
    currentLocale.value = locale
    if (process.client) {
      localStorage.setItem('locale', locale)
    }
  }

  const locale = computed(() => currentLocale.value)

  return {
    t,
    setLocale,
    locale
  }
}
