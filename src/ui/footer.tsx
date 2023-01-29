import React from 'react'
import { AppInfo } from './appInfo'

export const Footer = () => {
  return (
    <div className='footer'>
      <AppInfo />
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
  )
}
