import regexDoc from '../../../docs/regex.md'
import { MDDoc } from './renderer'
import React from 'react'
import { ExampleGallery } from './exampleGallery'

export const AdvancedTechniqueDocs = () => {
  return <div>
    <h2>Advanced search techniques</h2>
    <MDDoc>{regexDoc}</MDDoc>

    <ExampleGallery />
  </div>
}