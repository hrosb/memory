import { ref, computed } from 'vue'
import { useCookie } from '#app'
import en from '../locales/en.json'
import nb from '../locales/nb.json'

const translations = { en, nb }

export function useI18n() {
  // Use cookie instead of localStorage
  const localeCookie = useCookie('locale', {
    default: () => 'en',
    // Cookie will be available on both client and server
    sameSite: 'lax',
    // 1 year expiry
    maxAge: 31536000
  })

  const currentLocale = ref(localeCookie.value)

  // If on client side, check browser language for initial value
  if (process.client && !localeCookie.value) {
    const browserLang = navigator.language.toLowerCase()
    currentLocale.value = browserLang.startsWith('nb') ? 'nb' : 'en'
    localeCookie.value = currentLocale.value
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
    currentLocale.value = locale
    localeCookie.value = locale
  }

  const locale = computed(() => currentLocale.value)

  return {
    t,
    setLocale,
    locale
  }
}
