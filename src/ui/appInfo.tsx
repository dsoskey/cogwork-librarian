import React, { useContext, useState } from 'react'
import { FlagContext } from './flags'
import { useHighlightPrism } from '../api/local/syntaxHighlighting'
import { Link } from 'react-router-dom'
import gitcube from "../../docs/design/gitcube.md";
import { Route, Routes } from 'react-router'
import { MDDoc } from './docs/renderer'

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
    <>
      <h2>what is cogwork librarian?</h2>
      <p>
        <span onClick={tryLock}>cogwork librarian</span> wants to help you brainstorm and build cubes, battle
        boxes, and other custom magic formats. craft more complex queries to
        find the cards that fit your environment or archetype. save cards to
        your list for easy export. ignore cards you want to exclude from all
        future search results. load a custom list of cards that fit scryfall's
        card format to power the most custom environments with scryfall's
        syntax.
      </p>

      <h2>
        why should i use cogwork librarian? why not use scryfall directly?
      </h2>
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

      <h2>
        okay all of those are great but it's not enough for me yet. what else
        will cogwork librarian do in the future?
      </h2>
      <p>
        while nothing on this list is a guarantee, here are some features i'm
        looking to implement:
      </p>
      <ul>
        <li>locally-sourced syntax documentation</li>
        <li>query history</li>
        <li>shareable search links</li>
        <li>
          <Link to="/whats-next/git-cube">a more portable cube data format</Link>
        </li>
      </ul>

      <h2>this looks cool<span onClick={clickPin2}>!</span> how can i contribute?</h2>
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
    </>
  )
}

export function WhatsNext() {
  useHighlightPrism([]);

  return <div className="prose">
    <Routes>
      <Route path="/git-cube" element={<MDDoc>{gitcube}</MDDoc>}/>
    </Routes>
  </div>
}