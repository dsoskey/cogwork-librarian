import React, { ChangeEventHandler } from 'react'
import Prism from 'prismjs'
import { Language } from '../api/memory/syntaxHighlighting'

export interface InputProps {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  language?: Language
}

export const Input = ({ value, onChange, language }: InputProps) => {
  React.useLayoutEffect(() => {
    Prism.highlightAll()
  }, [value])

  return (
    <div className='query-editor'>
      <input
        className='controller coglib-prism-theme'
        value={value}
        onChange={onChange}
      />

      <pre tabIndex={-1} className={`language-${language ?? 'none'} display`}>
        <code className='match-braces'>{value}</code>
      </pre>
    </div>
  )
}
