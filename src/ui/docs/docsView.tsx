import React, { useEffect, useRef } from 'react'
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
import { NavBar } from './navBar'

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
  const { pathname, hash } = useLocation()
  const shouldScroll = useRef(false);
  useEffect(() => {
    if (shouldScroll.current) {
      const element = document.getElementById(hash ? hash.slice(1) : "page-title");
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    shouldScroll.current = true
  }, [hash]);

  useHighlightPrism([pathname])
  return <div className='docs-view'>
    <NavBar />
    <div className='docs-content'>
      <span className='alert'>&nbsp;these docs are under active construction!&nbsp;</span>
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