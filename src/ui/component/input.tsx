import React, { ChangeEventHandler, HTMLAttributes, useEffect, useRef, useState } from 'react'
import {
  Language,
  useHighlightPrism,
} from '../../api/local/syntaxHighlighting'
import "./input.css"

export interface InputProps extends HTMLAttributes<HTMLInputElement> {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  language?: Language
}

export const Input = ({ value, onChange, language, ...rest }: InputProps) => {
  const controller = useRef<HTMLInputElement>()
  const faker = useRef<HTMLPreElement>()
  const linker = useRef<HTMLPreElement>()
  const [revealLinks, setRevealLinks] = useState<boolean>(false)
  const onScroll = (event) => {
    faker.current.scrollLeft = event.target.scrollLeft
    linker.current.scrollLeft = event.target.scrollLeft
  }
  useHighlightPrism([value])

  useEffect(() => {
    controller.current?.addEventListener('scroll', onScroll)
    return () => controller.current?.removeEventListener('scroll', onScroll)
  }, [])

  const handleDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
      setRevealLinks(prev => !prev)
      if (revealLinks) {
        controller.current.focus()
      }
    }
  }

  return (
    <div className='query-editor query-input' onKeyDown={handleDown}>
      <pre ref={linker}
           tabIndex={-1}
           aria-hidden
           className={`language-${language ?? 'none'} links match-braces ${
             revealLinks ? 'show' : 'hide'
           }`}
      ><code>{value}</code></pre>
      <input
        {...rest}
        ref={controller}
        className={`controller coglib-prism-theme ${rest.className}`}
        value={value}
        onChange={onChange}
      />
      <pre ref={faker}
            aria-hidden
            tabIndex={-1}
            className={`language-${language ?? 'none'} display match-braces`}>
        <code>{value}</code></pre>
    </div>
  )
}
