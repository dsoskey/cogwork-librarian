import * as React from 'react'
import * as Scry from 'scryfall-sdk'
import { App } from './app'
import Prism from 'prismjs'
import {
  hookReactDOM,
  linkWrap,
  mtgql,
  mtgqlExtended,
  mtgqlExtendedMulti
} from './api/local/syntaxHighlighting'
import './prism-cogwork.css'
import './styles.css'
import "./ui/data/dataView.css"
import 'mana-font/css/mana.min.css'
import { FlagContextProvider } from './ui/flags'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { loadTheme } from './ui/component/theme'
import { createRoot } from 'react-dom/client'

const router = createBrowserRouter([
  { path: "*", Component: App }
])

Prism.languages['scryfall'] = mtgql
Prism.languages['scryfall-extended'] = mtgqlExtended
Prism.languages['scryfall-extended-multi'] = mtgqlExtendedMulti
Prism.languages['mtgql'] = mtgql
Prism.languages['mtgql-extended'] = mtgqlExtended
Prism.languages['mtgql-extended-multi'] = mtgqlExtendedMulti

Prism.hooks.add('wrap', linkWrap)
Prism.hooks.add('complete', hookReactDOM(router))

Scry.setTimeout(50)

loadTheme();

const root = createRoot(document.getElementById('app'));
root.render(<FlagContextProvider>
  <RouterProvider router={router} />
</FlagContextProvider>)
