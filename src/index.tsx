import * as React from 'react'
import { render } from 'react-dom'
import { App } from './app'
import * as Scry from 'scryfall-sdk'
import 'prismjs/components/prism-regex.js'
import 'prismjs/themes/prism-tomorrow.css'
import './styles.css'

Scry.setTimeout(50)

render(<App />, document.getElementById('app'))
