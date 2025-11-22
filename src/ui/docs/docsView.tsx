import React, { useEffect, useRef } from 'react'
import { MDDoc } from './renderer'
import keyboardShortcuts from '../../../docs/keyboardShortcuts.md?raw'
import "./docsView.css"
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { Route, Routes, useLocation } from 'react-router'
import { SyntaxDocs } from './syntaxDocs'
import { GettingStartedDocs } from './gettingStartedDocs'
import { Link } from 'react-router-dom'
import { ExtendedSyntaxDocs } from './extendedSyntaxDocs'
import { AdvancedTechniqueDocs } from './advancedTechniqueDocs'
import { NavBar } from './navBar'
import { Masthead } from '../component/masthead'
import { Footer } from '../footer'

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
        description='Learn the basics of running queries and managing data' />
      <LandingCard
        href='/user-guide/advanced-techniques'
        title='Advanced query techniques'
        description='Take searches to the next level, study sample queries, and learn to love regular expressions' />
    </div>
    <h3>Reference</h3>
    <div className='user-guide-cards'>
      <LandingCard
        href='/user-guide/keyboard-shortcuts'
        title='Keyboard shortcuts'
        description='Keep your hands on the keyboard for maximum flow' />
      <LandingCard
        href='/user-guide/query-syntax'
        title='Query syntax'
        description="Exhaustive documentation for Cogwork Librarian's base search syntax" />
      <LandingCard
        href='/user-guide/syntax-extension'
        title='Syntax extensions'
        description='All search syntax exclusive to Cogwork Librarian' />
    </div>
  </div>
}
export const DocsView = () => {
  const { pathname, hash } = useLocation()
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    const element = document.getElementById(hash ? hash.slice(1) : "page-title");
    element?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  useHighlightPrism(ref.current, [pathname])
  return <div className='docs-view' ref={ref}>
    <Masthead />
    <NavBar />
    <main className='docs-content'>
      <Routes>
        <Route path="getting-started" element={<GettingStartedDocs />} />
        <Route path="advanced-techniques" element={<AdvancedTechniqueDocs />} />
        <Route path="query-syntax" element={<SyntaxDocs />} />
        <Route path="syntax-extension" element={<ExtendedSyntaxDocs />} />
        <Route path="keyboard-shortcuts" element={<div><MDDoc>{keyboardShortcuts}</MDDoc></div>} />
        <Route path="" element={<LandingPage />} />
      </Routes>
      <Footer />
    </main>
  </div>
}