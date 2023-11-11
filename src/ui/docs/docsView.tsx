import React from 'react'
import { Link } from 'react-router-dom'
import { BaseSubExplanation } from './baseSubExplanation'
import { BasicSyntaxSection } from './basicSyntaxSection'
import andorText from '../../../docs/andOr/text.md'
import andorExample from '../../../docs/andOr/example.md'
import dbBasicsText from '../../../docs/dbBasics.md'
import { MDDoc } from './renderer'
import isText from '../../../docs/is/text.md'
import keyboardShortcuts from '../../../docs/keyboardShortcuts.md'
import "./docsView.css"
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { ExampleSection } from './exampleSection'
import { queryExamples } from '../../api/example'
// marketing - what's the general value prop, why use it over alternatives

export const DocsView = () => {
  useHighlightPrism([])
  return <div className='docs-view'>
    <nav className='docs-sidenav'>
      <h4>Getting started</h4>
      <ul>
        <li>Editor Basics (include comments)</li>
        <li>Base/Sub Explanation</li>
        <li>Search Results</li>
        <li>Saved cards</li>
        <li>Database basics</li>
      </ul>
      <h4></h4>
      <ul>
        <li>Cards</li>
        <li>Cubes</li>
      </ul>
      <h3>Reference</h3>
      <h4>Scryfall Query Syntax</h4>
      <ul>
        <li>each filter</li>
      </ul>
      <h4>Syntax extensions</h4>
      <ul>
        <li>Introduction & @ namespacing</li>
        <li>@alias & @use</li>
        <li>@include</li>
        <li>@defaultWeight</li>
        <li>@defaultMode</li>
      </ul>
    </nav>
    <div className='docs-content'>
      <h1>User guide</h1>

      <h2>Getting Started</h2>
      <p>Brainstorming in Cogwork Librarian is broken up into 3 core pieces:</p>
        <ol>
          <li>Query editor</li>
          <li>Search results</li>
          <li>Saved and ignored cards</li>
        </ol>
      <h3>Editor basics</h3>

      <img alt='screenshot of editor'/>
      <p>
        The editor is the first part of your brainstorming canvas.
        Here you can write multiple Scryfall-like queries in different forms and comments about these queries.
        Separate query sets with an empty line.
        Query sets can be a simple single-line query or a multiline query that uses the <Link to='#basesub'>base/sub query model</Link>.
        Comments are lines that start with the <code>#</code> symbol. Cogwork Librarian ignores these lines when parsing query sets.
        Search a query set by pressing the ▶️ button next to a query set's base query or
        by using the keyboard shortcut <code>CTRL + ENTER</code> while the cursor is within the query set.
      </p>

      <ExampleSection example={queryExamples[0]} />

      <BaseSubExplanation/>

      <section>
        <h3>Search results basics</h3>
        <p>
          Query results are divided into pages of 60.
          Hovering over a card shows options for seeing the card on scryfall and adding it to your saved and ignore lists.
          While hovering over a card, use the keyboard shortcut <code>A</code> to add cards to your saved list.
        </p>
      </section>

      <section>
        <h3>Saved and ignored cards</h3>
        <p>
          Cogwork Librarian stores one saved card and one ignored card list.
          View your saved cards in the search page by clicking "show saved cards".
          When you're ready to use your brainstorming list for the next step of your design cycle,
          click "copy to clipboard" to copy the saved cards.
          Ignored cards are filtered out of all search results.
        </p>
      </section>

      <MDDoc>{dbBasicsText}</MDDoc>

      <h2>Examples/Advanced Topics?</h2>
      <h3>Query Recipes</h3>
      <h3>Regex</h3>
      <p>these are commonly used queries or query sets.</p>

      <h2>Reference</h2>

      <MDDoc>{keyboardShortcuts}</MDDoc>

      <h3>Scryfall Query Syntax</h3>
      {/* Name exactNameCondition nameCondition nameRegexCondition */}
      {/* Colors, Identity, Mana Cost colorCondition colorIdentityCondition cmcCondition manaCostCondition */}
      {/* Type typeCondition typeRegexCondition */}
      {/* Text box oracleCondition oracleRegexCondition fullOracleCondition fullOracleRegexCondition keywordCondition */}
      {/* Power, toughness, loyalty, defense powerCondition toughCondition powTouCondition */}
      {/* Layout */}
      {/* Format */}
      {/* Artist */}
      {/* Tags */}
      <BasicSyntaxSection textMd={andorText} exampleMd={andorExample} />
      {/* Regex */}
      <MDDoc className='single-section-docs'>{isText}</MDDoc>
    </div>
  </div>
}