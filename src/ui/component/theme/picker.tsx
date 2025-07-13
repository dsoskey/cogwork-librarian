import React, { useContext, useEffect, useRef, useState } from 'react'
import { HslColorPicker } from 'react-colorful'
import cloneDeep from 'lodash/cloneDeep'
import { useLocalStorage } from '../../../api/local/useLocalStorage'
import { RangeField } from '../formField'
import { TextEditor } from '../editor/textEditor'
import { SAVAI_SACRIFICE_EXAMPLE } from '../../../api/example'
import {
  COLOR_SPACE_OPTIONS,
  HSL,
  HSLtoString,
  seedToTheme,
  SeedVersion,
  stringToHSL,
  Theme,
  ThemeSeed
} from '../../../api/local/types/theme'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../../api/local/db'
import { Modal } from '../modal'
import { PRESET_THEMES } from './presets'
import "./picker.css"
import { SettingsContext } from '../../settingsView'

function refreshTheme(theme: Theme, element: HTMLElement) {
  for (const key in theme) {
    element.style.setProperty(`--${key}`, theme[key])
  }
}
function refreshRootTheme(theme: Theme) {
  const root = document.documentElement;
  refreshTheme(theme, root);
  localStorage.setItem("theme.coglib.sosk.watch", JSON.stringify(theme))
}

export function loadTheme() {
  const rawTheme = localStorage.getItem("theme.coglib.sosk.watch")
  if (rawTheme) {
    const theme = JSON.parse(rawTheme) as Theme
    refreshRootTheme(theme);
  }
}

interface ThemeRowProps {
  name: string
  selected: boolean
  theme: Theme
  onClick: () => void
  children?: React.ReactNode
  brandBlend?: string
  blackGrowth?: string
  blackBase?: string
}

function ThemeRow({ name, selected, theme, onClick, children }: ThemeRowProps) {
  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    if (ref.current) {
      refreshTheme(theme, ref.current);
    }
  }, [ref.current, theme])
  return <div className='theme-row-border' ref={ref} style={{
    backgroundColor: theme.dark300,
    border: selected ? "var(--spacing-100) solid var(--active)" : "var(--spacing-100) solid var(--dark-color)"
  }}>
    <div onClick={onClick} className='row center theme-row-container' style={{ backgroundColor: theme.dark300 }}>
      <div style={{ color: theme.light600, paddingLeft: "var(--spacing-200)" }}>{name}</div>
      <div className='theme-row' style={{backgroundColor: theme.light600}}>
        {Object.keys(theme).map(it => {
          return <div key={it} className='theme-swatch' style={{backgroundColor: `var(--${it})`}} />
        })}
      </div>
    </div>
    {children}
  </div>

}

interface ThemeSampleProps {
  theme: Theme
}
function ThemeSample({ theme }: ThemeSampleProps) {
  const { lineHeight  } = useContext(SettingsContext);

  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    if (ref.current) {
      refreshTheme(theme, ref.current);
    }
  }, [ref.current, theme])
  return <div className='theme-sample' ref={ref}>
    <div className="row center">
      <span className="bold">projects: </span>
      <div className="project-tab row center active">
        <button>X</button>
        <div>morphin-around</div>
      </div>
      <div className="project-tab row center">
        <button>X</button>
        <div>cardboard-theory</div>
      </div>
      <button>manage projects</button>
      <button>export morphin-around</button>
    </div>
    <TextEditor
      disabled
      lineHeight={lineHeight}
      language='scryfall-extended-multi'
      setQueries={() => {}}
      queries={SAVAI_SACRIFICE_EXAMPLE.queries}
    />
  </div>
}

const CUSTOM_KEY = "_____custom_____"
export function ThemePicker() {
  const savedThemes = useLiveQuery(() => cogDB.theme.toArray(), [])

  const [selectedKey, setSelectedKey] = useLocalStorage<string>("theme-key.coglib.sosk.watch", "classic")
  const activeSavedTheme = savedThemes?.find(it => it.name === selectedKey);
  const [name, setName] = useState("custom 1")
  const [seed, _setSeed] = useLocalStorage<ThemeSeed>("custom-theme-seed.coglib.sosk.watch",{
    dark:   { h: 240, s: 100, l: 50 },
    light:  { h: 120 , s: 100, l: 50 },
    active: { h: 0, s: 100, l: 50 },
    brandBlend: 10,
    darkBase: 20,
    darkGrowth: 10,
    colorInterpolation: "in oklch",
    version: SeedVersion.V2,
  });
  const setSeed = (key: keyof ThemeSeed) => (newVal: HSL | number | string) => {
    _setSeed(prev => {
      const next = cloneDeep(prev);
      // @ts-ignore
      next[key] = newVal
      refreshRootTheme(seedToTheme(next))
      return next;
    })
    setSelectedKey(CUSTOM_KEY)
  }
  const theme = seedToTheme(seed)
  let selectedTheme: Theme | undefined = selectedKey === CUSTOM_KEY
    ? theme
    : PRESET_THEMES[selectedKey];
  if (selectedTheme === undefined) {
    selectedTheme = activeSavedTheme?.theme ?? seedToTheme(activeSavedTheme?.seed ?? seed);
  }
  const isSavedTheme = selectedKey !== CUSTOM_KEY && PRESET_THEMES[selectedKey] === undefined;

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("")
  const [dbWorking, setDbWorking] = useState<boolean>(false);

  const onDeleteClick = (key: string) => {
    setDbWorking(true);
    setErrorMessage("")
    cogDB.theme.delete(key)
      .then(() => {
        setShowDeleteModal(false);
      })
      .catch(e => setErrorMessage(e.message))
      .finally(() => setDbWorking(false));
  }


  return <div className="theme-controls">
    <div className='theme-picker'>
      {Object.keys(PRESET_THEMES).map(key => {
        const preset = PRESET_THEMES[key];
        const onClick = () => {
          refreshRootTheme(preset)
          setSelectedKey(key)
        }
        return <ThemeRow selected={selectedKey === key} key={key} name={key} onClick={onClick} theme={preset} />
      })}
      {savedThemes?.length > 0 && savedThemes.map(theme => {
        if (!theme.theme && !theme.seed) return null;

        const thisTheme = theme.theme ?? seedToTheme(theme.seed);
        const onClick = () => {
          refreshRootTheme(thisTheme)
          setSelectedKey(theme.name)
        }
        return <ThemeRow selected={selectedKey === theme.name} key={theme.name} name={theme.name} onClick={onClick} theme={thisTheme} />
      })}
      <ThemeRow selected={selectedKey === CUSTOM_KEY} name="custom" theme={theme} onClick={() => {
        refreshRootTheme(theme)
        setSelectedKey(CUSTOM_KEY)
      }} />
    </div>
    <div className='theme-shower column'>
      {selectedTheme === undefined && <div>choose a theme to continue</div>}
      {selectedTheme !== undefined && <div>
        {selectedKey !== CUSTOM_KEY && <h3>{selectedKey}</h3>}
        {selectedKey === CUSTOM_KEY && <input className='custom-theme-name' value={name} onChange={e => setName(e.target.value)} />}
        <ThemeSample theme={selectedTheme} />
        <em>your theme applied to the search page</em>
        {selectedKey !== CUSTOM_KEY && <div>
          <button onClick={() => {
            if (isSavedTheme && activeSavedTheme?.seed) {
              _setSeed(activeSavedTheme.seed);
            } else {
              _setSeed({
                active: stringToHSL(selectedTheme.active599),
                brandBlend: 10,
                colorInterpolation: 'in oklch',
                dark: stringToHSL(selectedTheme.dark300),
                darkBase: 20,
                darkGrowth: 10,
                light: stringToHSL(selectedTheme.light600),
                version: SeedVersion.V2
              })
            }
            setSelectedKey(CUSTOM_KEY)
            setName(`${selectedKey} copy`)
          }}>copy to custom</button>
          {isSavedTheme && <><button onClick={() => setShowDeleteModal(true)}>
            delete
          </button>
            <Modal
              open={showDeleteModal}
              title={<h2>Confirm Delete</h2>}
              onClose={() => setShowDeleteModal(false)}>
              <div>
                <p>
                  {"you are about to delete the theme "}
                  {selectedKey}
                  {". Type and press 'delete' to proceed."}
                </p>
                <div className="row">
                  <input
                    placeholder="delete"
                    value={confirmText}
                    onChange={event => setConfirmText(event.target.value)}
                  />
                  <button
                    disabled={confirmText !== "delete" || dbWorking}
                    onClick={() => onDeleteClick(selectedKey)}>
                    {dbWorking ? "deleting" : "delete"}
                  </button>
                </div>
                {errorMessage.length>0 && <div className='alert'>{errorMessage}</div>}
              </div>
            </Modal>
          </>}
        </div>}
        {selectedKey === CUSTOM_KEY && <>
          <h4>pick your colors</h4>
          <div className='row picker-container'>
            <div className='column center' style={{ backgroundColor: HSLtoString(seed.dark), color: HSLtoString(seed.light) }}>
              <div>&nbsp;dark&nbsp;</div>
              <HslColorPicker className='picker' color={seed.dark} onChange={setSeed('dark')} />
            </div>
            <div className='column center' style={{ backgroundColor: HSLtoString(seed.light), color: HSLtoString(seed.dark) }}>
              <div>light</div>
              <HslColorPicker className='picker' color={seed.light} onChange={setSeed('light')} />
            </div>
            <div className='column center' style={{ backgroundColor: HSLtoString(seed.active), color: HSLtoString(seed.dark) }}>
              <div>active</div>
              <HslColorPicker className='picker' color={seed.active} onChange={setSeed('active')} />
            </div>
          </div>
          <div className='color-space row baseline'>
            <span>color space:&nbsp;</span>
            <div className="row">
              {COLOR_SPACE_OPTIONS.map(option => <label key={option} className={`input-link ${option === seed.colorInterpolation ? "active-link" : ""}`}>
                <input
                  id={`color-space-${option}`}
                  type='radio'
                  value={option}
                  checked={option === seed.colorInterpolation}
                  onChange={() => setSeed("colorInterpolation")(option)}
                />
                {option}
              </label>)}
            </div>
          </div>
          <RangeField className="color-blend" title='dark blend' description="percentage mix of light color into darker color">
            <input
              className="dark-blend"
              type="range"
              min={0} max={100}
              value={seed.brandBlend}
              onChange={event => setSeed("brandBlend")(Number.parseInt(event.target.value))}/>
          </RangeField>
          <RangeField className="color-blend" title='dark base' description="base percentage of black mixed into darker colors">
            <input
              type="range"
              min={0} max={50}
              value={seed.darkBase}
              onChange={event => setSeed("darkBase")(Number.parseInt(event.target.value))}/>
          </RangeField>
          <RangeField className="color-blend" title='dark growth' description="percentage black mixed to generate each darker color">
            <input
              type="range"
              min={0} max={40}
              value={seed.darkGrowth}
              onChange={event => setSeed("darkGrowth")(Number.parseInt(event.target.value))} />
          </RangeField>
          <button onClick={() => {
            setErrorMessage("")
            const now = new Date();

            cogDB.theme.add({
              createdAt: now,
              type: "seed",
              updatedAt: now,
              name,
              seed,
            })
              .then(() => {
                setSelectedKey(name)
                setName(`custom ${savedThemes.length + 2}`)
              })
              .catch(e => setErrorMessage(e.message))
          }}>save theme</button>
          {errorMessage.length>0 && <div className='alert'>{errorMessage}</div>}
        </>}
      </div>}
    </div>
  </div>
}