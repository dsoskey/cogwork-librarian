import React from 'react'
import { MDDoc } from './renderer'
import keyboardShortcuts from '../../../docs/keyboardShortcuts.md'
import "./docsView.css"
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { Route, Routes, useLocation } from 'react-router'
import { SyntaxDocs } from './syntaxDocs'
import { GettingStartedDocs } from './gettingStartedDocs'
import { Link } from 'react-router-dom'
import { ExtendedSyntaxDocs } from './extendedSyntaxDocs'
import { AdvancedTechniqueDocs } from './advancedTechniqueDocs'

const LandingCard = ({ title, href, description }) => {
  return <Link to={href} className='landing-card'>
    <h4>{title}</h4>
    <p>{description}</p>
  </Link>
}

const LandingPage = () => {
  return <div>
    <h2>User guide</h2>
    <h3>Guides</h3>
    <div className='user-guide-cards'>
      <LandingCard
        href='/user-guide/getting-started'
        title='Getting started'
        description='learn the basics of running queries and managing data' />
      <LandingCard
        href='/user-guide/advanced-techniques'
        title='Advanced query techniques'
        description='take searches to the next level, study sample queries, and learn to love regular expressions' />
    </div>
    <h3>Reference</h3>
    <div className='user-guide-cards'>
      <LandingCard
        href='/user-guide/keyboard-shortcuts'
        title='Keyboard shortcuts'
        description='' />
      <LandingCard
        href='/user-guide/query-syntax'
        title='Query syntax'
        description="exhaustive documentation for cogwork librarian's base search syntax" />
      <LandingCard
        href='/user-guide/syntax-extension'
        title='Syntax extensions'
        description='all search syntax exclusive to cogwork librarian' />
    </div>
  </div>
}
export const DocsView = () => {
  const { pathname } = useLocation()
  useHighlightPrism([pathname])
  return <div className='docs-view'>
    <nav className='docs-sidenav'>
      <section>
        <h3>Guides</h3>
        <h4><Link to="/user-guide/getting-started">Getting started</Link></h4>
        <ul>
          <li>Editor basics</li>
          <li>Base/Sub explanation</li>
          <li>Search results</li>
          <li>Saved cards</li>
          <li>Data management</li>
        </ul>
        <h4><Link to="/user-guide/advanced-techniques">Advanced query techniques</Link></h4>
        <ul>
          <li>Regular expressions</li>
          <li>Example queries</li>
        </ul>
      </section>

      <section>
        <h3>Reference</h3>
        <h4><Link to="/user-guide/keyboard-shortcuts">Keyboard shortcuts</Link></h4>
        <h4><Link to="/user-guide/query-syntax">Query syntax</Link></h4>
        <ul>
          <li>each filter section</li>
        </ul>
        <h4><Link to="/user-guide/syntax-extension">Syntax extensions</Link></h4>
        <ul>
          <li>@alias & @use</li>
          <li>@defaultMode</li>
          <li>@defaultRank</li>
          <li>@include</li>
          <li>@venn</li>
        </ul>
      </section>
    </nav>
    <div className='docs-content'>
      <p className='alert'>these docs are under active construction!</p>
      <Routes>
        <Route path="getting-started" element={<GettingStartedDocs />} />
        <Route path="advanced-techniques" element={<AdvancedTechniqueDocs />} />
        <Route path="query-syntax" element={<SyntaxDocs />} />
        <Route path="syntax-extension" element={<ExtendedSyntaxDocs />} />
        <Route path="keyboard-shortcuts" element={<MDDoc>{keyboardShortcuts}</MDDoc>} />
        <Route path="" element={<LandingPage />} />
      </Routes>
    </div>
  </div>
}