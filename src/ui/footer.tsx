import React from 'react'
import "./footer.css"

export const Footer = () => {
  return (
    <footer className='footer'>
      <div className='links'>
        <div>
          <a
            href='https://github.com/dsoskey/cogwork-librarian'
            rel='noreferrer'
            target='_blank'
          >
            github
          </a>{' '}
          🐙
        </div>
        <div>
          <a
            href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=bug&template=bug_report.md&title='
            rel='noreferrer'
            target='_blank'
          >
            report a bug
          </a>{' '}
          🦟
        </div>
        <div>
          <a
            href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=enhancement&template=feature_request.md&title='
            rel='noreferrer'
            target='_blank'
          >
            feature request
          </a>{' '}
          💡
        </div>
      </div>
      <div className='legalese'>
        <p>
          portions of cogwork librarian are unofficial Fan Content permitted
          under the Wizards of the Coast Fan Content Policy. The literal and
          graphical information presented on this site about Magic: The
          Gathering, including card images, mana symbols, and Oracle text, is
          copyright Wizards of the Coast, LLC, a subsidiary of Hasbro, Inc.
          cogwork librarian is not produced by or endorsed by Wizards of the
          Coast.
        </p>
        <p>
          The Scryfall logo is copyright Scryfall, LLC. cogwork librarian is not
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
}
