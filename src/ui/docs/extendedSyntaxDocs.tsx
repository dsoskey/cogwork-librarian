import React from 'react'
import syntaxExtensions from "../../../docs/syntaxExtensions/intro.md"
import defaultAlias from "../../../docs/syntaxExtensions/alias.md"
import defaultWeight from "../../../docs/syntaxExtensions/weight.md"
import include from "../../../docs/syntaxExtensions/include.md"
import mode from "../../../docs/syntaxExtensions/mode.md"
import venn from "../../../docs/syntaxExtensions/venn.md"
import domain from "../../../docs/syntaxExtensions/domain.md"
import { MDDoc, titleificate } from './renderer'

export const extendedSyntaxSectionTitles = [
  defaultAlias, domain, mode, defaultWeight, include, venn
].map(titleificate);

export const ExtendedSyntaxDocs = () => {
  return <div>
    <MDDoc>{syntaxExtensions}</MDDoc>
    <MDDoc>{defaultAlias}</MDDoc>
    <MDDoc>{domain}</MDDoc>
    <MDDoc>{mode}</MDDoc>
    <MDDoc>{defaultWeight}</MDDoc>
    <MDDoc>{include}</MDDoc>
    <MDDoc>{venn}</MDDoc>
  </div>
}