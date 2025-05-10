import React from 'react'
import "./footer.css"
import { InnertubeWidget } from '../component/innertubeWidget'
import { AsSeenOn } from './asSeenOn'
import { BugIcon } from '../icons/bug'
import { GithubIcon } from '../icons/github'
import { CoinIcon } from '../icons/coins'
import { LightbulbIcon } from '../icons/lightbulb'

export const Footer = React.memo(() => {
  return (
    <footer className='footer'>
      <div className='links'>
        <div className="row center">
          <a
            href='https://github.com/dsoskey/cogwork-librarian'
            rel='noreferrer'
            target='_blank'
          >
            github
          </a>
          <GithubIcon />
        </div>
        <div className="row center">
          <a
            href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=bug&template=bug_report.md&title='
            rel='noreferrer'
            target='_blank'
          >
            report a bug
          </a>
          <BugIcon />
        </div>
        <div className="row center">
          <a
            href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=enhancement&template=feature_request.md&title='
            rel='noreferrer'
            target='_blank'
          >
            feature request
          </a>
          <LightbulbIcon />
        </div>
        <div className="row center">
          <a
            href="https://ko-fi.com/cogworklibrarian"
            rel="noreferrer"
            target="_blank"
          >
            donate
          </a>
          <CoinIcon />
        </div>
      </div>
      <div className="row">
        <InnertubeWidget />
        <a href='https://open.spotify.com/episode/3FzTQvEsejQbg8FjuJJ7dk?si=b3a484641b304fc3' target="_blank" rel="noreferrer">
          <AsSeenOn />
        </a>
      </div>
      <div className='legalese'>
        <p>
          Portions of Cogwork Librarian are unofficial Fan Content permitted
          under the Wizards of the Coast Fan Content Policy. The literal and
          graphical information presented on this site about Magic: The
          Gathering, including card images, mana symbols, and Oracle text, is
          copyright Wizards of the Coast, LLC, a subsidiary of Hasbro, Inc.
          Cogwork Librarian is not produced by or endorsed by Wizards of the
          Coast.
        </p>
        <p>
          The Scryfall logo is copyright Scryfall, LLC. Cogwork Librarian is not
          produced by or endorsed by Scryfall, LLC.
        </p>
        <p>
          All other content licensed under{' '}
          <a
            href='https://github.com/dsoskey/cogwork-librarian/blob/main/LICENSE'
            rel='noreferrer'
            target='_blank'
          >
            GPL v3
          </a>
          .
        </p>
      </div>
    </footer>
  )
});
