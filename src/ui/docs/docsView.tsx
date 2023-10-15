import React from 'react'
import { Link } from 'react-router-dom'
import { BaseSubExplanation } from './baseSubExplanation'
import { BasicSyntaxSection } from './basicSyntaxSection'
import andorText from '../../../docs/andOr/text.md'
import andorExample from '../../../docs/andOr/example.md'
import { MDDoc } from './renderer'
import isText from '../../../docs/is/text.md'
import "./docsView.css"
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
// marketing - what's the general value prop, why use it over alternatives

export const DocsView = () => {
  useHighlightPrism([])
  return <div className='docs-view'>
    <div className='docs-sidenav'>
      <section>
        Getting started
        - Editor Basics (include comments)
        - Base/Sub Explanation
        - Search Results
        - Saved cards
      </section>
      <section>
        Data management
        - Cards
        - Cubes
      </section>
      <section>
        Scryfall Query Syntax
        - each filter
      </section>
      <section>
        Syntax extensions
        - Introduction & @ namespacing
        - @alias & @use
        - @include
        - @defaultWeight
        - @defaultMode
      </section>
    </div>
    <div className='docs-content'>
      <h1>User guide</h1>

      <h2>Getting Started</h2>
      <p>Brainstorming in Cogwork Librarian is broken up into 3 core pieces:</p>
        <ol>
          <li>Query Editor</li>
          <li>Search Results</li>
          <li>Saved Cards</li>
        </ol>
      <h3>Editor basics</h3>
      <img  alt='screenshot of editor'/>
      <p>
        The editor is the first part of your brainstorming canvas.
        Here you can write multiple Scryfall-like queries in different forms and comments about these queries.
        Cogwork Librarian considers each paragraph separated by an empty line a query set.
        Query sets can be a simple single-line query or a multiline query that uses the <Link to='#basesub'>base/sub query model</Link>.
        Comments are lines that start with the `#` symbol. Cogwork Librarian ignores these lines when parsing query sets.
        Search a query set by pressing the ▶️ button to the left of the query set or by pressing <code>CTRL + ENTER</code> while the cursor is within the query set.
      </p>

      <BaseSubExplanation/>

      <section>
        <h3>Search results basics</h3>
      </section>

      <section>
        <h3>Saved cards</h3>
      </section>

      <h3>Database basics</h3>

      <h2>Examples/Advanced Topics?</h2>
      <h3>Query Recipes</h3>
      <p>these are commonly used queries or query sets.</p>

      <h2>Reference</h2>
      <h3>Keyboard Shortcuts</h3>

      <h3>Scryfall Query Syntax</h3>
      <BasicSyntaxSection textMd={andorText} exampleMd={andorExample} />
      <MDDoc className='single-section-docs'>{isText}</MDDoc>
    </div>
  </div>
}