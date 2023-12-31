import React from 'react'
import syntaxExtensions from "../../../docs/syntaxExtensions/intro.md"
import alias from "../../../docs/syntaxExtensions/alias.md"
import rank from "../../../docs/syntaxExtensions/rank.md"
import include from "../../../docs/syntaxExtensions/include.md"
import mode from "../../../docs/syntaxExtensions/mode.md"
import venn from "../../../docs/syntaxExtensions/venn.md"
import { MDDoc, titleificate } from './renderer'

export const extendedSyntaxSectionTitles = [alias, rank, include, mode, venn]
  .map(titleificate);

export const ExtendedSyntaxDocs = () => {
  return <div>
    <MDDoc>{syntaxExtensions}</MDDoc>
    <MDDoc>{alias}</MDDoc>
    <MDDoc>{mode}</MDDoc>
    <MDDoc>{rank}</MDDoc>
    <MDDoc>{include}</MDDoc>
    <MDDoc>{venn}</MDDoc>
  </div>
}