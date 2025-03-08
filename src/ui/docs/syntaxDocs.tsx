import { FILTER_KEYWORDS } from 'mtgql'
import React from 'react'
import { syntaxDocs } from '../../api/local/syntaxDocs'
import { BasicSyntaxSection } from './basicSyntaxSection'
import nameText from '../../../docs/syntaxReference/name/text.md'
import nameExample from '../../../docs/syntaxReference/name/example.md'
import colorText from '../../../docs/syntaxReference/color/text.md'
import colorExample from '../../../docs/syntaxReference/color/example.md'
import manaText from '../../../docs/syntaxReference/mana/text.md'
import manaExample from '../../../docs/syntaxReference/mana/example.md'
import typeText from '../../../docs/syntaxReference/type/text.md'
import typeExample from '../../../docs/syntaxReference/type/example.md'
import textBoxText from '../../../docs/syntaxReference/textBox/text.md'
import textBoxExample from '../../../docs/syntaxReference/textBox/example.md'
import tagsText from '../../../docs/syntaxReference/tags/text.md'
import tagsExample from '../../../docs/syntaxReference/tags/example.md'
import cubeText from '../../../docs/syntaxReference/cube/text.md'
import cubeExample from '../../../docs/syntaxReference/cube/example.md'
import formatText from '../../../docs/syntaxReference/format/text.md'
import formatExample from '../../../docs/syntaxReference/format/example.md'
import setText from '../../../docs/syntaxReference/sets/text.md'
import setExample from '../../../docs/syntaxReference/sets/example.md'
import pricesText from '../../../docs/syntaxReference/prices/text.md'
import pricesExample from '../../../docs/syntaxReference/prices/example.md'
import combatBoxText from '../../../docs/syntaxReference/combatBox/text.md'
import combatBoxExample from '../../../docs/syntaxReference/combatBox/example.md'
import andorText from '../../../docs/syntaxReference/andOr/text.md'
import andorExample from '../../../docs/syntaxReference/andOr/example.md'
import sortOrderText from '../../../docs/syntaxReference/sort/text.md'
import { MDDoc, titleificate } from './renderer'
import isText from '../../../docs/syntaxReference/is/text.md'
import { Link } from 'react-router-dom'

export const syntaxSectionTitles = [
  nameText,
  colorText,
  manaText,
  typeText,
  textBoxText,
  combatBoxText,
  formatText,
  setText,
  cubeText,
  tagsText,
  andorText,
  isText,
  sortOrderText,
  pricesText,
].map(titleificate);

export const SyntaxDocs = () => {
  return <div className='user-guide-root'>
    <h2>Query syntax</h2>
    <p>
      Cogwork Librarian's local query processor uses a reverse-engineered
      variant of Scryfall's syntax. This page only covers Scryfall-compatible syntax;
      see <Link to="/user-guide/extended-syntax">our extended syntax guide</Link>
      {' '}for more information on cogwork librarian's extra search features.
      please{' '}
      <a
        href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=bug&template=bug_report.md&title='
        target='_blank'
        rel='noreferrer'
      >
        report any inconsistencies
      </a>{' '}
      you find between Scryfall and Cogwork Librarian so we can make this
      tool the best it can be together :)

    </p>
    <BasicSyntaxSection textMd={nameText} exampleMd={nameExample} />
    <BasicSyntaxSection textMd={colorText} exampleMd={colorExample} />
    <BasicSyntaxSection textMd={manaText} exampleMd={manaExample} />
    <BasicSyntaxSection textMd={typeText} exampleMd={typeExample} />
    <BasicSyntaxSection textMd={textBoxText} exampleMd={textBoxExample} />
    <BasicSyntaxSection textMd={combatBoxText} exampleMd={combatBoxExample} />
    <BasicSyntaxSection textMd={formatText} exampleMd={formatExample} />
    {/* Layout  */}
    {/* Artist */}

    <BasicSyntaxSection textMd={setText} exampleMd={setExample} />
    <BasicSyntaxSection textMd={cubeText} exampleMd={cubeExample} />
    <BasicSyntaxSection textMd={tagsText} exampleMd={tagsExample} />
    <BasicSyntaxSection textMd={andorText} exampleMd={andorExample} />
    <MDDoc className='single-section-docs'>{isText}</MDDoc>
    <MDDoc className="single-section-docs">{sortOrderText}</MDDoc>
    <BasicSyntaxSection textMd={pricesText} exampleMd={pricesExample} />
  </div>
}
