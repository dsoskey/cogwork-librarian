import React, { useContext, useState } from 'react'
import { queryExamples } from '../api/example'
import {
  injectPrefix as _injectPrefix,
  SCORE_PRECISION,
  weightAlgorithms,
} from '../api/queryRunnerCommon'
import { rankInfo, renderQueryInfo } from './component/textEditor'
import { FlagContext } from '../flags'
import { Link } from 'react-router-dom'
import "./appInfo.css"
import { useHighlightPrism } from '../api/local/syntaxHighlighting'

const EXAMPLE = queryExamples[0]
const injectPrefix = _injectPrefix(EXAMPLE.prefix)

export const AppInfoLink = () => <Link to='/about-me'>about me</Link>

export const AppInfo = () => {
  const { setFlag } = useContext(FlagContext)
  const [pin1, setPin1] = useState(false)
  const [pin2, setPin2] = useState(false)
  useHighlightPrism([])

  const tryLock = () => {
    if (pin1) {
      if (pin2) {
        localStorage.setItem("admin.coglib.sosk.watch", "~")
        setPin2(false)
      }
      setFlag('adminMode', true)
      setPin1(false)
    } else {
      setFlag('adminMode', false)
      localStorage.removeItem("admin.coglib.sosk.watch")
    }
  }

  const clickPin2 = () => {
    if (pin1) {
      setPin2(true)
    }
  }

  return (
    <div className='app-info-root'>
      <p>
        <span onClick={tryLock}>cogwork librarian</span> wants to help you brainstorm and build cubes, battle
        boxes, and other custom magic formats. craft more complex queries to
        find the cards that fit your environment or archetype. save cards to
        your list for easy export. ignore cards you want to exclude from all
        future search results. load a custom list of cards that fit scryfall's
        card format to power the most custom environments with scryfall's
        syntax.
      </p>

      <p>
        cogwork librarian is in the alpha stage of development, so expect
        things to change and grow alongside our understanding of the tool.
      </p>

      <h3>
        why should i use cogwork librarian? why not use scryfall directly?
      </h3>
      <p>
        for the average search query, scryfall is more than sufficient.
        cogwork librarian offers some key advantages over scryfall:
      </p>
      <ol>
        <li>
          it is designed with brainstorming lists in mind. the ignorelist and
          the base/sub query model let you focus only on the subset of cards
          that you care about
        </li>
        <li>
          the in-memory query processor allows cogwork librarian to run
          offline after the initial database download. this also makes the
          search orders of magnitude faster than communicating with scryfall
          directly. why wait for answers<span onClick={() => setPin1(true)}>?</span>
        </li>
        <li>
          cogwork librarian works with any scryfall-compatible list of cards,
          including custom cards! download any of scryfall's bulk data sets
          through cogwork librarian itself, or import your own json file to
          use a custom data set.
        </li>
      </ol>

      <h3>how does the base/sub query model work?</h3>
      <p>
        the base/sub query model aims to let you curate complex searches with
        minimal syntax. it uses a custom 3-step algorithm on top of scryfall's
        filter syntax:
      </p>
      <ol>
        <li>combine the base query with each subquery</li>
        <li>
          weigh each query, assigning that weight to each card in the query
        </li>
        <li>aggregate cards by total query weight</li>
      </ol>

      <h4>1. combine the base query with each subquery</h4>
      <p>starting from an input like this:</p>
      <div className='example-query'>
        <pre className='language-none'>
          <code>
            {renderQueryInfo(rankInfo)([
              EXAMPLE.prefix,
              ...EXAMPLE.queries,
            ]).join('\n')}
          </code>
        </pre>
        <pre className='language-scryfall-extended'>
          <code>{[EXAMPLE.prefix, ...EXAMPLE.queries].join('\n')}</code>
        </pre>
      </div>

      <p>cogwork librarian transforms the queries into this:</p>
      <pre className='language-scryfall'>
        <code>{EXAMPLE.queries.map(injectPrefix).join('\n')}</code>
      </pre>
      <p>
        this lets you treat the first query as the total set of cards you want
        to see in each subquery.
      </p>

      <h4>
        2. weigh each query, assigning that weight to each card in the query
      </h4>
      <p>
        once prepared, each query is weighed by its order in the list of
        queries (first being highest)
      </p>
      <pre className='language-scryfall'>
        <code>
          {EXAMPLE.queries
            .map(injectPrefix)
            .map(
              (it, index) =>
                `[${weightAlgorithms
                  .zipf(index)
                  .toPrecision(SCORE_PRECISION)}] ${it}`
            )
            .join('\n')}
        </code>
      </pre>

      <h4>3. aggregate cards by total query weight</h4>
      <p>
        cards in multiple queries get their combined weight, so their final
        placement rises above cards that matched fewer or lower placed queries
        (tip: use scryfall's <code>or</code> syntax to give two queries the
        same weight)
      </p>

      <h3>
        okay all of those are great but it's not enough for me yet. what else
        will cogwork librarian do in the future?
      </h3>
      <p>
        while nothing on this list is a guarantee, here are some features i'm
        looking to implement:
      </p>
      <ul>
        <li>locally-sourced syntax documentation</li>
        <li>query history</li>
        <li>
          full scryfall syntax support for in-memory filtering, potentially as
          a standalone code library
        </li>
        <li>project import/export with per-project saved/ignored lists</li>
        <li>shareable search links</li>
      </ul>

      <h3>this looks cool<span onClick={clickPin2}>!</span> how can i contribute?</h3>
      <p>
        at the moment, i need people to test cogwork librarian. try it out for
        your next cube project and see if it helps you level up your queries.{' '}
        <a
          href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=bug&template=bug_report.md&title='
          rel='noreferrer'
          target='_blank'
        >
          bug reports
        </a>{' '}
        and{' '}
        <a
          href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=enhancement&template=feature_request.md&title='
          rel='noreferrer'
          target='_blank'
        >
          feature requests
        </a>{' '}
        are encouraged!
      </p>
    </div>
  )
}
