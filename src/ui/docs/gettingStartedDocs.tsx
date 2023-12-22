import { DocsExample } from './exampleSection'
import { INTRO_EXAMPLE } from '../../api/example'
import { BaseSubExplanation } from './baseSubExplanation'
import { MDDoc } from './renderer'
import dbBasicsText from '../../../docs/gettingStarted/dbBasics.md'
import searchResultsText from '../../../docs/gettingStarted/searchResults.md'
import savedCardsText from '../../../docs/gettingStarted/savedCards.md'
import React from 'react'


export const GettingStartedDocs = () => {
  const description = <p>
    The editor is the first part of your brainstorming canvas.
    Here you can write multiple Scryfall-like queries in different forms and comments about these queries.
    Separate query sets with an empty line.
    Query sets can be a simple single-line query or a multiline query that uses the <a href='#basesub'>base/sub query model</a>.
    Comments are lines that start with the <code>#</code> symbol. Cogwork Librarian ignores these lines when parsing query sets.
    Search a query set by pressing the ▶️ button next to a query set's base query or
    by using the keyboard shortcut <code>CTRL + ENTER</code> while the cursor is within the query set.
  </p>
  return <div>
    <h2>Getting started</h2>
    <p>Brainstorming in Cogwork Librarian is broken up into 3 core pieces:</p>
    <ol>
      <li>Query editor</li>
      <li>Search results</li>
      <li>Saved and ignored cards</li>
    </ol>

    <DocsExample example={{ prefix: "", queries: INTRO_EXAMPLE.slice(0, -2), title: "Editor Basics", description }} />

    <BaseSubExplanation/>

    <MDDoc>{searchResultsText}</MDDoc>
    <MDDoc>{savedCardsText}</MDDoc>
    <MDDoc>{dbBasicsText}</MDDoc>
  </div>
}