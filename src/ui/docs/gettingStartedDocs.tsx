import React from 'react'
import { BaseSubExplanation } from './baseSubExplanation'
import { MDDoc, titleificate } from './renderer'
import intro from '../../../docs/gettingStarted/intro.md'
import dbBasics from '../../../docs/gettingStarted/dbBasics.md'
import editorBasics from '../../../docs/gettingStarted/editorBasics.md'
import searchResults from '../../../docs/gettingStarted/searchResults.md'
import savedCards from '../../../docs/gettingStarted/savedCards.md'
import { KNIGHTS_EXAMPLE } from '../../api/example'

export const gettingStartedSectionTitles = [
  editorBasics,
  "Base/Sub query model\n\n ",
  searchResults,
  savedCards,
  dbBasics,
].map(titleificate);

export const GettingStartedDocs = () => {
  return <div>
    <MDDoc>{intro}</MDDoc>
    <MDDoc>{editorBasics}</MDDoc>
    <BaseSubExplanation example={KNIGHTS_EXAMPLE} />
    <MDDoc>{searchResults}</MDDoc>
    <MDDoc>{savedCards}</MDDoc>
    <MDDoc>{dbBasics}</MDDoc>
  </div>
}