import React from 'react'
import { ThemePicker } from './component/theme'
import "./settingsView.css"

export function SettingsView() {
  return <div className="settings-view-root">
    <h2>theme</h2>

    <ThemePicker />
  </div>
}