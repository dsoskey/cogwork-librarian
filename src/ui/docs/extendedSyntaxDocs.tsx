import React from 'react'
import { DocsExample } from './exampleSection'
import { ALIAS_EXAMPLE, VENN_EXAMPLE } from '../../api/example'
import syntaxExtensions from "../../../docs/syntaxExtensions/intro.md"
import rank from "../../../docs/syntaxExtensions/rank.md"
import include from "../../../docs/syntaxExtensions/include.md"
import mode from "../../../docs/syntaxExtensions/mode.md"
import { MDDoc } from './renderer'

const aliasDesc = "similar to defining a function in programming languages, `@alias` defines a single query that you can reuse with the `@use` directive. aliases are defined in their own paragraph and cannot use other aliases."

export const ExtendedSyntaxDocs = () => {
  return <div>
    <MDDoc>{syntaxExtensions}</MDDoc>
    <DocsExample example={{
      prefix: "",
      queries: ALIAS_EXAMPLE,
      title: "@alias & @use",
      description: <MDDoc>{aliasDesc}</MDDoc>
    }} />
    <MDDoc>{mode}</MDDoc>
    <MDDoc>{rank}</MDDoc>
    <MDDoc>{include}</MDDoc>
    <DocsExample example={{
      prefix: "",
      queries: VENN_EXAMPLE,
      title: "@venn diagram search",
      description: undefined
    }} />
  </div>
}