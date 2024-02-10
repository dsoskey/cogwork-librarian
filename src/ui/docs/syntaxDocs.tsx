import { FILTER_KEYWORDS } from '../../mql'
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
import combatBoxText from '../../../docs/syntaxReference/combatBox/text.md'
import combatBoxExample from '../../../docs/syntaxReference/combatBox/example.md'
import andorText from '../../../docs/syntaxReference/andOr/text.md'
import andorExample from '../../../docs/syntaxReference/andOr/example.md'
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
  andorText,
  isText,
].map(titleificate);

export const SyntaxDocs = () => {
  return <div className='user-guide-root'>
    <h2>Query syntax</h2>
    <p>
      cogwork librarian's local query processor uses a reverse-engineered
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
      you find between Scryfall and cogwork librarian so we can make this
      tool the best it can be together :)

    </p>
    <BasicSyntaxSection textMd={nameText} exampleMd={nameExample} />
    <BasicSyntaxSection textMd={colorText} exampleMd={colorExample} />
    <BasicSyntaxSection textMd={manaText} exampleMd={manaExample} />
    <BasicSyntaxSection textMd={typeText} exampleMd={typeExample} />
    <BasicSyntaxSection textMd={textBoxText} exampleMd={textBoxExample} />
    <BasicSyntaxSection textMd={combatBoxText} exampleMd={combatBoxExample} />
    {/* Layout  */}
    {/* Format */}
    {/* Artist */}
    {/* Tags oracle, art, cubes */}
    <BasicSyntaxSection textMd={andorText} exampleMd={andorExample} />
    <MDDoc className='single-section-docs'>{isText}</MDDoc>

    <h2 className='todo-supported-color'>supported keywords</h2>
    <ul>
      {Object.keys(FILTER_KEYWORDS).map((keyword) => (
        <li key={keyword}>
          <a href={syntaxDocs[keyword]}>{keyword}</a>
        </li>
      ))}
    </ul>
  </div>
}
