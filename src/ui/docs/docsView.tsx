import React from 'react'
import { MDDoc } from './renderer'
import keyboardShortcuts from '../../../docs/keyboardShortcuts.md'
import regexDoc from '../../../docs/regex.md'
import "./docsView.css"
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { Route, Routes, useLocation } from 'react-router'
import { ScryfallSyntaxDocs } from './scryfallSyntaxDocs'
import { GettingStartedDocs } from './gettingStartedDocs'
import { Link } from 'react-router-dom'
import { ExtendedSyntaxDocs } from './extendedSyntaxDocs'
// marketing - what's the general value prop, why use it over alternatives

const oldContent = <div className='docs-content'>


  <h2>Examples/Advanced Topics?</h2>
  <h3>Query Recipes</h3>

  <MDDoc>{regexDoc}</MDDoc>
</div>
export const DocsView = () => {
  const { pathname } = useLocation()
  useHighlightPrism([pathname])
  return <div className='docs-view'>
    <nav className='docs-sidenav'>
      <h3><Link to="/user-guide/getting-started">Getting started</Link></h3>
      <ul>
        <li>Editor basics </li>
        <li>Base/Sub explanation</li>
        <li>Search results</li>
        <li>Saved cards</li>
        <li>Data management</li>
      </ul>
      <h3></h3>
      <h3>Reference</h3>
      <h4><Link to="/user-guide/keyboard-shortcuts">Keyboard shortcuts</Link></h4>
      <h4><Link to="/user-guide/scryfall-syntax">Query syntax</Link></h4>
      <ul>
        <li>each filter</li>
      </ul>
      <h4><Link to="/user-guide/syntax-extension">Syntax extensions</Link></h4>
      <ul>
        <li>@alias & @use</li>
        <li>@defaultMode</li>
        <li>@defaultRank</li>
        <li>@include</li>
        <li>@venn</li>
      </ul>
    </nav>
    <div className='docs-content'>
      <p className='alert'>these docs are under active construction!</p>
      <Routes>
        <Route path="getting-started" element={<GettingStartedDocs />} />
        <Route path="scryfall-syntax" element={<ScryfallSyntaxDocs />} />
        <Route path="syntax-extension" element={<ExtendedSyntaxDocs />} />
        <Route path="keyboard-shortcuts" element={<MDDoc>{keyboardShortcuts}</MDDoc>} />
        <Route element={<div>Im gonna be a landing page!</div>} />
      </Routes>
    </div>
  </div>
}