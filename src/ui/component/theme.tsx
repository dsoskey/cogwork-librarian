import React from 'react'
import { HslColorPicker } from 'react-colorful'
import cloneDeep from 'lodash/cloneDeep'
import { useLocalStorage } from '../../api/local/useLocalStorage'

interface HSL {
  h: number
  s: number
  l: number
  a?: number
}

function HSLtoString(hsl: HSL): string {
  const { h, s, l , a } = hsl;
  return `hsl(${h}, ${s}%, ${l}%${a !== undefined ? `, ${a}%` : ""})`
}


interface ThemeSeed {
  dark: HSL;
  light: HSL;
  active: HSL;
}

function seedToTheme(seed: ThemeSeed): Theme {
  return {
    dark100: HSLtoString({ ...seed.dark, h: seed.dark.h > 0 ? seed.dark.h - 1 : 0, l: seed.dark.l * 6 / 18 }),
    dark150: HSLtoString({ ...seed.dark, h: seed.dark.h > 0 ? seed.dark.h - 1 : 0, l: seed.dark.l * 10 / 18 }),
    dark200: HSLtoString({ ...seed.dark, l: seed.dark.l * 14 / 18 }),
    dark300: HSLtoString(seed.dark),
    light600: HSLtoString(seed.light),
    active599: HSLtoString({ ...seed.active, a: 100 }),
    active575: HSLtoString({ ...seed.active, a: 75 }),
    active550: HSLtoString({ ...seed.active, a: 50 }),
  }
}

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
function refreshTheme(theme: Theme) {
  const root = document.documentElement;
  for (const key in theme) {
    root.style.setProperty(`--${key}`, theme[key])
  }
  localStorage.setItem("theme.coglib.sosk.watch", JSON.stringify(theme))
}

export function loadTheme() {
  const rawTheme = localStorage.getItem("theme.coglib.sosk.watch")
  if (rawTheme) {
    const theme = JSON.parse(rawTheme) as Theme
    refreshTheme(theme);
  }
}



const PRESET_THEMES: { [key: string]: Theme } = {
  "classic": {
    dark100: "hsl(25, 31%, 12%)",
    dark150: "hsl(24, 20%, 20%)",
    dark200: "hsl(25, 32%, 20%)",
    dark300: "hsl(25, 32%, 27%)",
    light600: "hsl(19, 41%, 88%)",
    active599: "hsl(180, 100%, 69%, 100%)",
    active575: "hsl(180, 100%, 69%, 75%)",
    active550: "hsl(180, 100%, 69%, 50%)",
  },
  "'97": {
    dark100: "hsl(349, 31%, 12%)",
    dark150: "hsl(349, 20%, 20%)",
    dark200: "hsl(350, 32%, 20%)",
    dark300: "hsl(350, 61%, 17%)",
    light600: "hsl(41, 92%, 65%)",
    active599: "hsl(160, 100%, 69%, 100%)",
    active575: "hsl(160, 100%, 69%, 75%)",
    active550: "hsl(160, 100%, 69%, 50%)",
  },
  "surveil getup": {
    dark100: "hsl(257, 31%, 6%)",
    dark150: "hsl(257, 20%, 10%)",
    dark200: "hsl(258, 21%, 14%)",
    dark300: "hsl(258, 21%, 18%)",
    light600: "hsl(228, 33%, 97%)",
    active599: "hsl(323, 80%, 69%, 100%)",
    active575: "hsl(323, 80%, 69%, 75%)",
    active550: "hsl(323, 80%, 69%, 50%)",
  },
  "surveil lifted": {
    dark100: "hsl(257, 31%, 6%)",
    dark150: "hsl(257, 20%, 10%)",
    dark200: "hsl(258, 21%, 14%)",
    dark300: "hsl(258, 21%, 18%)",
    light600: "hsl(228, 33%, 97%)",
    active599: "hsl(350, 96%, 59%, 100%)",
    active575: "hsl(350, 96%, 59%, 75%)",
    active550: "hsl(350, 96%, 59%, 50%)",
  },
  chiller: {
    "dark100": "hsl(235, 64%, 22%)",
    "dark150": "hsl(235, 64%, 36.666666666666664%)",
    "dark200": "hsl(236, 64%, 51.333333333333336%)",
    "dark300": "hsl(236, 64%, 66%)",
    "light600": "hsl(209, 28%, 78%)",
    "active599": "hsl(60, 100%, 91%, 100%)",
    "active575": "hsl(60, 100%, 91%, 75%)",
    "active550": "hsl(60, 100%, 91%, 50%)"
  },
  melonade: {
    "dark100": "hsl(359, 100%, 12.333333333333334%)",
    "dark150": "hsl(359, 100%, 20.555555555555557%)",
    "dark200": "hsl(360, 100%, 28.77777777777778%)",
    "dark300": "hsl(360, 100%, 37%)",
    "light600": "hsl(341, 100%, 77%)",
    "active599": "hsl(89, 100%, 50%, 100%)",
    "active575": "hsl(89, 100%, 50%, 75%)",
    "active550": "hsl(89, 100%, 50%, 50%)"
  },
  "hacker-shit": {
    "dark100": "hsl(135, 100%, 3.6666666666666665%)",
    "dark150": "hsl(135, 100%, 6.111111111111111%)",
    "dark200": "hsl(136, 100%, 8.555555555555555%)",
    "dark300": "hsl(136, 100%, 11%)",
    "light600": "hsl(179, 100%, 70%)",
    "active599": "hsl(110, 100%, 55%, 100%)",
    "active575": "hsl(110, 100%, 55%, 75%)",
    "active550": "hsl(110, 100%, 55%, 50%)"
  },
  "white lotus": {
    "dark100": "hsl(349, 0%, 33.333333333333336%)",
    "dark150": "hsl(349, 0%, 55.55555555555556%)",
    "dark200": "hsl(350, 0%, 77.77777777777777%)",
    "dark300": "hsl(350, 0%, 100%)",
    "light600": "hsl(41, 0%, 0%)",
    "active599": "hsl(271, 79%, 69%, 100%)",
    "active575": "hsl(271, 79%, 69%, 75%)",
    "active550": "hsl(271, 79%, 69%, 50%)"
  },
  "black lotus": {
    "dark100": "hsl(282, 11%, 6.333333333333333%)",
    "dark150": "hsl(282, 11%, 10.555555555555555%)",
    "dark200": "hsl(283, 11%, 14.777777777777779%)",
    "dark300": "hsl(283, 11%, 19%)",
    "light600": "hsl(260, 30%, 90%)",
    "active599": "hsl(267, 100%, 78%, 100%)",
    "active575": "hsl(267, 100%, 78%, 75%)",
    "active550": "hsl(267, 100%, 78%, 50%)"
  },
  "all hallow's eve": {
    "dark100": "hsl(32, 17%, 3.6666666666666665%)",
    "dark150": "hsl(32, 17%, 6.111111111111111%)",
    "dark200": "hsl(33, 17%, 8.555555555555555%)",
    "dark300": "hsl(33, 17%, 11%)",
    "light600": "hsl(41, 0%, 100%)",
    "active599": "hsl(24, 85%, 60%, 100%)",
    "active575": "hsl(24, 85%, 60%, 75%)",
    "active550": "hsl(24, 85%, 60%, 50%)"
  },
}

interface ThemeRowProps {
  name: string
  selected: boolean
  theme: Theme
  onClick: () => void
  children?: React.ReactNode
}
function ThemeRow({ name, selected, theme, onClick, children }: ThemeRowProps) {

  return <div className='theme-row-border' style={{ backgroundColor: theme.dark300, border: selected ? "var(--spacing-100) solid var(--active)" : "var(--spacing-100) solid var(--dark-color)" }}>
    <div onClick={onClick} className='row center theme-row-container' style={{ backgroundColor: theme.dark300 }}>
      <div style={{ color: theme.light600, paddingLeft: "var(--spacing-200)" }}>{name}</div>
      <div className='theme-row' style={{backgroundColor: theme.light600}}>
        {Object.keys(theme).map(it => {
          return <div key={it} className='theme-swatch' style={{backgroundColor: theme[it]}} />
        })}
      </div>
    </div>
    {children}
  </div>

}
export function ThemePicker() {
  const [seed, _setSeed] = useLocalStorage<ThemeSeed>("custom-theme-seed.coglib.sosk.watch",{
    dark:   { h: 240, s: 100, l: 50 },
    light:  { h: 120 , s: 100, l: 50 },
    active: { h: 0, s: 100, l: 50 },
  });
  const [selectedKey, setSelectedKey] = useLocalStorage<string>("theme-key.coglib.sosk.watch", "classic")
  const theme = seedToTheme(seed)

  const setSeed = (key: keyof ThemeSeed) => (newHSL: HSL) => {
    _setSeed(prev => {
      const next = cloneDeep(prev);
      next[key] = newHSL
      refreshTheme(seedToTheme(next))
      return next;
    })
    setSelectedKey("custom")
  }

  return <div className="theme-picker">
    {Object.keys(PRESET_THEMES).map(key => {
      const onClick = () => {
        refreshTheme(PRESET_THEMES[key])
        setSelectedKey(key)
      }
      return <ThemeRow selected={selectedKey === key} key={key} name={key} onClick={onClick} theme={PRESET_THEMES[key]} />
    })}
    <ThemeRow selected={selectedKey === "custom"} name={"custom"} theme={theme} onClick={() => {
      refreshTheme(theme)
      setSelectedKey("custom")
    }} >
      {selectedKey === "custom" && <div className="row picker-container">
        <div className="column center">
          <div style={{ backgroundColor: HSLtoString(seed.light), color: HSLtoString(seed.dark) }}>&nbsp;dark&nbsp;</div>
          <HslColorPicker className="picker" color={seed.dark} onChange={setSeed("dark")} />
        </div>
        <div className="column center">
          <div style={{ color: HSLtoString(seed.light) }}>light</div>
          <HslColorPicker className="picker" color={seed.light} onChange={setSeed("light")} />
        </div>
        <div className="column center">
          <div style={{ color: HSLtoString(seed.active) }}>active</div>
          <HslColorPicker className="picker" color={seed.active} onChange={setSeed("active")} />
        </div>
      </div>}

    </ThemeRow>

  </div>
}