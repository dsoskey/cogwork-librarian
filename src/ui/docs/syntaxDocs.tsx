import {
  keywords,
} from '../../api/memory/types/filterKeyword'
import React from 'react'
import { syntaxDocs } from '../../api/local/syntaxDocs'
import { BasicSyntaxSection } from './basicSyntaxSection'
import nameText from '../../../docs/name/text.md'
import nameExample from '../../../docs/name/example.md'
import colorText from '../../../docs/color/text.md'
import colorExample from '../../../docs/color/example.md'
import manaText from '../../../docs/mana/text.md'
import manaExample from '../../../docs/mana/example.md'
import typeText from '../../../docs/type/text.md'
import typeExample from '../../../docs/type/example.md'
import andorText from '../../../docs/andOr/text.md'
import andorExample from '../../../docs/andOr/example.md'
import { MDDoc, titleificate } from './renderer'
import isText from '../../../docs/is/text.md'
import { Link } from 'react-router-dom'

export const syntaxSectionTitles = [
  nameText,
  colorText,
  manaText,
  typeText,
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
    {/* Text box oracleCondition oracleRegexCondition fullOracleCondition fullOracleRegexCondition keywordCondition */}
    {/* Power, toughness, loyalty, defense powerCondition toughCondition powTouCondition */}
    {/* Layout */}
    {/* Format */}
    {/* Artist */}
    {/* Tags */}
    <BasicSyntaxSection textMd={andorText} exampleMd={andorExample} />
    <MDDoc className='single-section-docs'>{isText}</MDDoc>

    <h2 className='todo-supported-color'>supported keywords</h2>
    <ul>
      {Object.keys(keywords).map((keyword) => (
        <li key={keyword}>
          <a href={syntaxDocs[keyword]}>{keyword}</a>
        </li>
      ))}
    </ul>
  </div>
}
