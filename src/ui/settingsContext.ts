import { createContext } from 'react'
import { GutterColumn } from './component/editor/multiQueryActionBar'
import { Setter } from '../types'

interface UserSettings {
  gutterColumns: GutterColumn[]
  setGutterColumns: Setter<GutterColumn[]>
  lineHeight: number
  setLineHeight: Setter<number>
}
export const SettingsContext = createContext<UserSettings>({
  setGutterColumns: () => {},
  gutterColumns: [],
  lineHeight: 0,
  setLineHeight: () => {},
})
