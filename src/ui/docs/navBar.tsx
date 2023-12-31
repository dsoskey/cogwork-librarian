import { gettingStartedSectionTitles } from './gettingStartedDocs'
import { advancedTechniqueTitles } from './advancedTechniqueDocs'
import { syntaxSectionTitles } from './syntaxDocs'
import { extendedSyntaxSectionTitles } from './extendedSyntaxDocs'
import React from 'react'
import { useLocation } from 'react-router'
import { idificate } from './renderer'
import { Link } from 'react-router-dom'

interface HashLinkProps {
  to: string
  hash?: string
  children: React.ReactNode
}
const HashLink = ({ to, hash, children }: HashLinkProps) => {
  const { pathname, hash: currentHash } = useLocation()
  const id = hash ? `#${idificate(hash)}`:""
  const href = `${to}${id}`

  return  <Link
    className={`${pathname}${currentHash}` === href ? "active": ""}
    to={href}
    children={children}
    // reloadDocument={hash && pathname === to}
  />
}

interface NavSectionProps {
  title: React.ReactNode
  route: string
  subtitles?: string[]
}
const NavSection = ({ title, route, subtitles }: NavSectionProps) => {
  return <>
    <h4><HashLink to={route}>{title}</HashLink></h4>
    {subtitles && subtitles.length > 0 && <ul>
      {subtitles.map(it => <li key={it}><HashLink to={route} hash={it}>{it}</HashLink></li>)}
    </ul>}
  </>
}
export const NavBar = () => {
  return <nav className='docs-sidenav'>
    <section>
      <h3>Guides</h3>
      <NavSection
        title="Getting started"
        route="/user-guide/getting-started"
        subtitles={gettingStartedSectionTitles}
      />
      <NavSection
        title="Advanced query techniques"
        route="/user-guide/advanced-techniques"
        subtitles={advancedTechniqueTitles}
      />
    </section>

    <section>
      <h3>Reference</h3>
      <NavSection title="Keyboard shortcuts" route="/user-guide/keyboard-shortcuts" />
      <NavSection
        title="Query syntax"
        route="/user-guide/query-syntax"
        subtitles={syntaxSectionTitles}
      />
      <NavSection
        title="Syntax extensions"
        route="/user-guide/syntax-extension"
        subtitles={extendedSyntaxSectionTitles} />
    </section>
  </nav>
}