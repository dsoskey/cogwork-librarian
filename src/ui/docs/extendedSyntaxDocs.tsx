import React from 'react'
import syntaxExtensions from "../../../docs/syntaxExtensions/intro.md"
import defaultAlias from "../../../docs/syntaxExtensions/alias.md"
import defaultWeight from "../../../docs/syntaxExtensions/weight.md"
import mode from "../../../docs/syntaxExtensions/mode.md"
import venn from "../../../docs/syntaxExtensions/venn.md"
import domain from "../../../docs/syntaxExtensions/domain.md"
import { MDDoc, titleificate } from './renderer'
import { stdlib } from '../../api/mtgql-ep/aliasLibs'

export const extendedSyntaxSectionTitles = [
  defaultAlias, domain, mode, defaultWeight, "@include", venn
].map(titleificate);

function include(now: Date) {
  const lib = stdlib(now)
  return `
### @include

Add \`@include:stdlib\` in its own paragraph to make the following aliases available for use:

\`\`\`scryfall-extended-multi
${Object.values(lib).map(alias => `${alias.description ? "# " + alias.description + "\n": ""}@alias:${alias.name}(${alias.query})`).join('\n\n')}
\`\`\`
`
}

export function ExtendedSyntaxDocs() {
  const now = new Date()
  return <div>
    <MDDoc>{syntaxExtensions}</MDDoc>
    <MDDoc>{defaultAlias}</MDDoc>
    <MDDoc>{domain}</MDDoc>
    <MDDoc>{mode}</MDDoc>
    <MDDoc>{defaultWeight}</MDDoc>
    <MDDoc>{include(now)}</MDDoc>
    <MDDoc>{venn}</MDDoc>
  </div>
}