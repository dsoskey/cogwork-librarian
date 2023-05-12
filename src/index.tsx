import * as React from 'react'
import { render } from 'react-dom'
import { App } from './app'
import * as Scry from 'scryfall-sdk'
import Prism from 'prismjs'
import {
  linkWrap,
  scryfall,
  scryfallExtended,
} from './api/local/syntaxHighlighting'
import './prism-cogwork.css'
import './styles.css'
import { FlagContextProvider } from './flags'
import { BrowserRouter } from 'react-router-dom'

Prism.languages['scryfall'] = scryfall
Prism.languages['scryfall-extended'] = scryfallExtended

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
