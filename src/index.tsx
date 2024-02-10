import * as React from 'react'
import { render } from 'react-dom'
import { App } from './app'
import * as Scry from 'scryfall-sdk'
import Prism from 'prismjs'
import {
  linkWrap,
  scryfall,
  scryfallExtended,
  scryfallExtendedMulti
} from './api/local/syntaxHighlighting'
import './prism-cogwork.css'
import './styles.css'
import 'mana-font/css/mana.min.css'
import { FlagContextProvider } from './ui/flags'
import { BrowserRouter } from 'react-router-dom'

Prism.languages['scryfall'] = scryfall
Prism.languages['scryfall-extended'] = scryfallExtended
Prism.languages['scryfall-extended-multi'] = scryfallExtendedMulti

Prism.hooks.add('wrap', linkWrap)

Scry.setTimeout(50)

render(
  <FlagContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </FlagContextProvider>,
  document.getElementById('app')
)
