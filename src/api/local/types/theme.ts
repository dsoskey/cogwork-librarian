export interface Theme {
  dark100: string;
  dark150: string;
  dark200: string;
  dark300: string;
  light600: string;
  active599: string;
  active575: string;
  active550: string;
}

export interface ThemeDefinition {
  name: string
  type: "theme" | "seed"
  createdAt: Date
  updatedAt: Date
  theme?: Theme
  seed?: ThemeSeed
}

export interface HSL {
  h: number
  s: number
  l: number
  a?: number
}

export function HSLtoString(hsl: HSL): string {
  const { h, s, l, a } = hsl
  return `hsl(${h}, ${s}%, ${l}%${a !== undefined ? `, ${a}%` : ''})`
}

export function stringToHSL(str: string): HSL {
  const matches = Array.from(str.matchAll(/(\d+(?:\.\d+)?)/g));
  if (matches.length === 3) {
    const nums = matches.map(it => Number.parseInt(it[0]))
    return { h: nums[0], s: nums[1], l: nums[2] }
  }

  if (matches.length === 4) {
    const nums = matches.map(it => Number.parseInt(it[0]))
    return { h: nums[0], s: nums[1], l: nums[2], a: nums[3] }

  }

  throw Error(`stringToHSL(${str}) failed! need 3 or 4 matches.`)
}

export enum SeedVersion {
  V1, V2
}

export const COLOR_SPACE_OPTIONS = ['in srgb', 'in oklch', 'in oklch longer hue']
export interface ThemeSeed {
  dark: HSL;
  light: HSL;
  active: HSL;
  darkBase?: number;
  darkGrowth?: number;
  brandBlend?: number;
  colorInterpolation?: string
  version: SeedVersion
}

function seedToThemeV1(seed: ThemeSeed): Theme {
  return {
    dark100: HSLtoString({ ...seed.dark, h: seed.dark.h > 0 ? seed.dark.h - 1 : 0, l: seed.dark.l * 6 / 18 }),
    dark150: HSLtoString({ ...seed.dark, h: seed.dark.h > 0 ? seed.dark.h - 1 : 0, l: seed.dark.l * 10 / 18 }),
    dark200: HSLtoString({ ...seed.dark, l: seed.dark.l * 14 / 18 }),
    dark300: HSLtoString(seed.dark),
    light600: HSLtoString(seed.light),
    active599: HSLtoString({ ...seed.active, a: 100 }),
    active575: HSLtoString({ ...seed.active, a: 75 }),
    active550: HSLtoString({ ...seed.active, a: 50 })
  }
}

function seedToThemeV2(seed: ThemeSeed): Theme {
  const brandBlend = seed.brandBlend ?? 10
  const darkBase = seed.darkBase ?? 20
  const darkGrowth = seed.darkGrowth ?? 10
  const colorInterpolation = seed.colorInterpolation ?? 'in oklch'
  const activeBase = 5
  const activeGrowth = 15
  const mix = `color-mix(${colorInterpolation}, var(--dark300), var(--light600) ${brandBlend}%)`

  return {
    dark100: `color-mix(${colorInterpolation}, ${mix}, black ${Math.min(100, darkBase + 3 * darkGrowth)}%)`,
    dark150: `color-mix(${colorInterpolation}, ${mix}, black ${Math.min(100, darkBase + 2 * darkGrowth)}%)`,
    dark200: `color-mix(${colorInterpolation}, ${mix}, black ${Math.min(100, darkBase + 1 * darkGrowth)}%)`,
    dark300: HSLtoString(seed.dark),
    light600: HSLtoString(seed.light),
    active599: HSLtoString({ ...seed.active, a: 100 }),
    active575: `color-mix(${colorInterpolation}, var(--active599), transparent ${Math.min(100, activeBase + 1 * activeGrowth)}%)`,
    active550: `color-mix(${colorInterpolation}, var(--active599), transparent ${Math.min(100, activeBase + 2 * activeGrowth)}%)`
  }
}

export function seedToTheme(seed: ThemeSeed): Theme {
  switch (seed.version) {
    case SeedVersion.V1:
      return seedToThemeV1(seed)
    case SeedVersion.V2:
    default:
      return seedToThemeV2(seed)
  }
}