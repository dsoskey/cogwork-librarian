import regexDoc from '../../../docs/regex.md?raw'
import randomExample from '../../../docs/syntaxReference/sort/random-example.md?raw'
import examples from '../../../docs/examples.md?raw'
import { MDDoc, newPre, titleificate } from './renderer'
import React from 'react'

export const advancedTechniqueTitles = [regexDoc, "Example queries\n\n ",]
  .map(titleificate)

export const AdvancedTechniqueDocs = () => {
  return <div>
    <h2>Advanced search techniques</h2>
    <MDDoc>{regexDoc}</MDDoc>
    <MDDoc overrides={{ pre: newPre }}>{examples}</MDDoc>
    <MDDoc overrides={{ pre: newPre }}>{randomExample}</MDDoc>
  </div>
}