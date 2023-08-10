import { createMediaQuery } from '@solid-primitives/media'
import { createSignal } from 'solid-js'

type TColorScheme = 'follow-system' | 'dark' | 'light'

const isSystemDarkScheme = createMediaQuery('(prefers-color-scheme: dark)')
const getSystemColorScheme = (): TColorScheme => (isSystemDarkScheme() ? 'dark' : 'light')
const [colorScheme, setColorScheme] = createSignal<TColorScheme>(localStorage.getItem('theme') as TColorScheme ?? 'follow-system')
const getColorScheme = () => (colorScheme() === 'follow-system' ? getSystemColorScheme() : colorScheme())

type TColors = {
  bg: string
  text: string
}

// eslint-disable-next-line no-unused-vars
const colors: { [key in TColorScheme]?: TColors } = {
  light: {
    bg: '#ababab',
    text: '#000'
  },
  dark: {
    bg: '#212121',
    text: '#fff'
  }
}

export const useTheme = () => ({
  colorScheme: getColorScheme,
  setColorScheme: (colorScheme: TColorScheme) => {
    localStorage.setItem('theme', colorScheme)
    setColorScheme(colorScheme)
  },
  colors: colors[getColorScheme()]
})

// rtc = replace theme colors
// Replaces "bg-[{bg}]" with "bg-[#ababab]"
export const rtc = (str: string) => {
  let out = str
  const c = colors[getColorScheme()]
  for (const _key in c) {
    const key = _key as keyof typeof c
    const value = c[key]
    out = out.replaceAll(`{${key}}`, value)
  }
  return out
}