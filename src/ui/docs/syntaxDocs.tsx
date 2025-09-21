import React from 'react'
import { BasicSyntaxSection } from './basicSyntaxSection'
import nameText from '../../../docs/syntaxReference/name/text.md?raw'
import nameExample from '../../../docs/syntaxReference/name/example.md?raw'
import colorText from '../../../docs/syntaxReference/color/text.md?raw'
import colorExample from '../../../docs/syntaxReference/color/example.md?raw'
import manaText from '../../../docs/syntaxReference/mana/text.md?raw'
import manaExample from '../../../docs/syntaxReference/mana/example.md?raw'
import typeText from '../../../docs/syntaxReference/type/text.md?raw'
import typeExample from '../../../docs/syntaxReference/type/example.md?raw'
import textBoxText from '../../../docs/syntaxReference/textBox/text.md?raw'
import textBoxExample from '../../../docs/syntaxReference/textBox/example.md?raw'
import tagsText from '../../../docs/syntaxReference/tags/text.md?raw'
import tagsExample from '../../../docs/syntaxReference/tags/example.md?raw'
import cubeText from '../../../docs/syntaxReference/cube/text.md?raw'
import cubeExample from '../../../docs/syntaxReference/cube/example.md?raw'
import formatText from '../../../docs/syntaxReference/format/text.md?raw'
import formatExample from '../../../docs/syntaxReference/format/example.md?raw'
import gameText from '../../../docs/syntaxReference/games/text.md?raw'
import gameExample from '../../../docs/syntaxReference/games/example.md?raw'
import setText from '../../../docs/syntaxReference/sets/text.md?raw'
import setExample from '../../../docs/syntaxReference/sets/example.md?raw'
import reprintsText from '../../../docs/syntaxReference/reprints/text.md?raw'
import reprintsExample from '../../../docs/syntaxReference/reprints/example.md?raw'
import pricesText from '../../../docs/syntaxReference/prices/text.md?raw'
import pricesExample from '../../../docs/syntaxReference/prices/example.md?raw'
import combatBoxText from '../../../docs/syntaxReference/combatBox/text.md?raw'
import combatBoxExample from '../../../docs/syntaxReference/combatBox/example.md?raw'
import printPreferenceText from '../../../docs/syntaxReference/printPreference/text.md?raw'
import printPreferenceExample from '../../../docs/syntaxReference/printPreference/example.md?raw'
import idsText from '../../../docs/syntaxReference/ids/text.md?raw'
import idsExample from '../../../docs/syntaxReference/ids/example.md?raw'
import newText from '../../../docs/syntaxReference/new/text.md?raw'
import newExample from '../../../docs/syntaxReference/new/example.md?raw'
import rarityText from '../../../docs/syntaxReference/rarity/text.md?raw'
import rarityExample from '../../../docs/syntaxReference/rarity/example.md?raw'
import dateText from '../../../docs/syntaxReference/date/text.md?raw'
import dateExample from '../../../docs/syntaxReference/date/example.md?raw'
import languageText from '../../../docs/syntaxReference/language/text.md?raw'
import languageExample from '../../../docs/syntaxReference/language/example.md?raw'
import flavorText from '../../../docs/syntaxReference/flavor/text.md?raw'
import flavorExample from '../../../docs/syntaxReference/flavor/example.md?raw'
import frameText from '../../../docs/syntaxReference/frame/text.md?raw'
import frameExample from '../../../docs/syntaxReference/frame/example.md?raw'
import andorText from '../../../docs/syntaxReference/andOr/text.md?raw'
import andorExample from '../../../docs/syntaxReference/andOr/example.md?raw'
import sortOrderText from '../../../docs/syntaxReference/sort/text.md?raw'
import { MDDoc, titleificate } from './renderer'
import isText from '../../../docs/syntaxReference/is/text.md?raw'
import { Link } from 'react-router-dom'

export const syntaxSectionTitles = [
  cubeText,
  nameText,
  colorText,
  manaText,
  typeText,
  textBoxText,
  combatBoxText,
  formatText,
  gameText,
  setText,
  reprintsText,
  newText,
  dateText,
  rarityText,
  flavorText,
  frameText,
  tagsText,
  andorText,
  isText,
  printPreferenceText,
  sortOrderText,
  pricesText,
  languageText,
  idsText,
].map(titleificate);

export const SyntaxDocs = () => {
  return <div className='user-guide-root'>
    <h2>Query syntax</h2>
    <p>
      Cogwork Librarian's local query processor uses a reverse-engineered
      variant of Scryfall's syntax. This page only covers Scryfall-compatible syntax;
      see <Link to="/user-guide/extended-syntax">our extended syntax guide</Link>
      {' '}for more information on Cogwork Librarian's extra search features.
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
    <BasicSyntaxSection textMd={cubeText} exampleMd={cubeExample} />
    <BasicSyntaxSection textMd={nameText} exampleMd={nameExample} />
    <BasicSyntaxSection textMd={colorText} exampleMd={colorExample} />
    <BasicSyntaxSection textMd={manaText} exampleMd={manaExample} />
    <BasicSyntaxSection textMd={typeText} exampleMd={typeExample} />
    <BasicSyntaxSection textMd={textBoxText} exampleMd={textBoxExample} />
    <BasicSyntaxSection textMd={combatBoxText} exampleMd={combatBoxExample} />
    <BasicSyntaxSection textMd={formatText} exampleMd={formatExample} />
    <BasicSyntaxSection textMd={gameText} exampleMd={gameExample} />
    <BasicSyntaxSection textMd={setText} exampleMd={setExample} />
    <BasicSyntaxSection textMd={reprintsText} exampleMd={reprintsExample} />
    <BasicSyntaxSection textMd={newText} exampleMd={newExample} />
    <BasicSyntaxSection textMd={dateText} exampleMd={dateExample} />
    <BasicSyntaxSection textMd={rarityText} exampleMd={rarityExample} />
    <BasicSyntaxSection textMd={flavorText} exampleMd={flavorExample} />
    <BasicSyntaxSection textMd={frameText} exampleMd={frameExample} />
    <BasicSyntaxSection textMd={tagsText} exampleMd={tagsExample} />
    <BasicSyntaxSection textMd={andorText} exampleMd={andorExample} />
    <MDDoc className='single-section-docs'>{isText}</MDDoc>
    <BasicSyntaxSection textMd={printPreferenceText} exampleMd={printPreferenceExample} />
    <MDDoc className="single-section-docs">{sortOrderText}</MDDoc>
    <BasicSyntaxSection textMd={pricesText} exampleMd={pricesExample} />
    <BasicSyntaxSection textMd={languageText} exampleMd={languageExample} />
    <BasicSyntaxSection textMd={idsText} exampleMd={idsExample} />
  </div>
}
