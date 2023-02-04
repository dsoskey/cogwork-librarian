import React, { ChangeEventHandler, useEffect, useRef } from 'react'
import Prism from 'prismjs'
import { Language } from '../../api/memory/syntaxHighlighting'

export interface InputProps {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  language?: Language
}

export const Input = ({ value, onChange, language }: InputProps) => {
  const controller = useRef<HTMLInputElement>()
  const faker = useRef<HTMLPreElement>()
  const onScroll = (event) => {
    faker.current.scrollLeft = event.target.scrollLeft
  }
  React.useLayoutEffect(() => {
    Prism.highlightAll()
  }, [value])

  useEffect(() => {
    controller.current.addEventListener('scroll', onScroll)
    return () => controller.current.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className='query-editor'>
      <input
        ref={controller}
        className='controller coglib-prism-theme'
        value={value}
        onChange={onChange}
      />

      <pre
        ref={faker}
        tabIndex={-1}
        className={`language-${language ?? 'none'} display`}
      >
        <code className='match-braces'>{value}</code>
      </pre>
    </div>
  )
}
