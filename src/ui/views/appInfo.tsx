import React, { useContext, useState } from 'react'
import { FlagContext } from '../flags'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { Link } from 'react-router-dom'
import gitcube from "../../../docs/design/gitcube.md";
import { Route, Routes } from 'react-router'
import { MDDoc } from '../docs/renderer'

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
      <h2>what is Cogwork Librarian?</h2>
      <p>
        <span className={pin1 ? "info-key" : "disengaged"} onClick={tryLock}>Cogwork Librarian</span>
        &nbsp;helps you brainstorm and build cubes, battle boxes, and other custom magic formats faster.
        Craft more complex queries to find the cards that fit your environment or archetype.
        Save cards to your list for easy export.
        Ignore cards you want to exclude from all future search results.
        Load a custom list of cards that fit Scryfall's
        card format to power the most custom environments with Scryfall's syntax.
      </p>

      <h2>
        Why should i use Cogwork Librarian? why not use Scryfall directly?
      </h2>
      <p>
        for the average one-off search query, Scryfall is more than sufficient.
        Cogwork Librarian offers some key advantages over Scryfall:
      </p>
      <ol>
        <li>
          it is designed with brainstorming lists in mind.
          organize multiple query sets into a single project to keep relevant queries together.
          the ignorelist and the base/sub query model let you focus only on the subset of cards
          that you care about
        </li>
        <li>
          Cogwork Librarian runs its queries locally, speeding up large searches by multiple orders of magnitude.
          Why wait for answers<span className={pin1 ? 'engaged' : 'info-key'} onClick={() => setPin1(true)}>?</span>
        </li>
        <li>
          Import your cubes from a list, <a href="https://cubecobra.com" rel='noreferrer' target='_blank'>CubeCobra</a>
          , or&nbsp;
          <a href="https://cubeartisan.net/" rel='noreferrer' target='_blank'>CubeArtisan</a>
          &nbsp;to enable searching for your list of cards within the same Scryfall queries you'd normally write.
          Cogwork Librarian also has a number of features to help you explore, visualize, and play your cubes:
          <ul>
            <li>Search-powered data visualizations</li>
            <li>A color breakdown table for any number of search filters</li>
            <li>Proxy printing</li>
            <li>Community-sourced combo identification, powered by <a href="https://commanderspellbook.com" rel="noreferrer" target="_blank">Commander Spellbook</a></li>
          </ul>
        </li>
        <li>
          Cogwork Librarian works with any Scryfall-compatible list of cards,
          including custom cards! download any of Scryfall's bulk data sets
          through Cogwork Librarian itself, or import your own json file to
          use a custom data set.
        </li>
        <li>
          Cogwork Librarian now offers data sourced by <a href='https://mtgjson.com/' rel='noreferrer' target='_blank'>MTGJSON</a>!
          This dataset lets you search cards by their originally printed types and text boxes.
          This feature is currently in beta, bugs are more likely and not all search features work with this data set.
        </li>
      </ol>

      <h2>
        okay all of those are great but it's not enough for me yet. what else
        will Cogwork Librarian do in the future?
      </h2>
      <p>
        while nothing on this list is a guarantee, here are some features i'm
        looking to implement:
      </p>
      <ul>
        <li>query history</li>
        <li>shareable search links</li>
        <li>
          <Link to="/whats-next/git-cube">a more portable cube data format</Link>
        </li>
      </ul>

      <h2>this looks cool<span className={pin2 ? "engaged" : (pin1 ? "info-key" : "")} onClick={clickPin2}>!</span> how can i contribute?</h2>
      <p>
        At the moment, I need people to test Cogwork Librarian. Try it out for
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