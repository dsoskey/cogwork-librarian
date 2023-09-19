import React, { useContext, useState } from 'react'
import { FlagContext } from '../flags'
import "./appInfo.css"
import { useHighlightPrism } from '../api/local/syntaxHighlighting'
import { BaseSubExplanation } from './docs/baseSubExplanation'

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
      <h3>what is this thing???</h3>
      <p>
        <span onClick={tryLock}>cogwork librarian</span> wants to help you brainstorm and build cubes, battle
        boxes, and other custom magic formats. craft more complex queries to
        find the cards that fit your environment or archetype. save cards to
        your list for easy export. ignore cards you want to exclude from all
        future search results. load a custom list of cards that fit scryfall's
        card format to power the most custom environments with scryfall's
        syntax.
      </p>
      <br />

      <h3>
        why should i use cogwork librarian? why not use scryfall directly?
      </h3>
      <p>
        for the average one-off search query, scryfall is more than sufficient.
        cogwork librarian offers some key advantages over scryfall:
      </p>
      <ol>
        <li>
          it is designed with brainstorming lists in mind.
          organize multiple query sets into a single project to keep relevant queries together.
          the ignorelist and the base/sub query model let you focus only on the subset of cards
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
      <br />


      <BaseSubExplanation />
      <br />

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
      <br/>

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
