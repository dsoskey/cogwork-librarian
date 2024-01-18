import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import {
  Language,
  useHighlightPrism,
} from '../../api/local/syntaxHighlighting'

export interface InputProps {
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  language?: Language
}

const linkKeys = ['Meta', 'Control']
export const Input = ({ value, onChange, language }: InputProps) => {
  const controller = useRef<HTMLInputElement>()
  const faker = useRef<HTMLPreElement>()
  const linker = useRef<HTMLPreElement>()
  const [revealLinks, setRevealLinks] = useState<boolean>(false)
  const showLinks = (event) => {
    if (linkKeys.includes(event.key)) {
      setRevealLinks(true)
    }
  }
  const hideLinks = (event) => {
    if (linkKeys.includes(event.key)) {
      setRevealLinks(false)
      controller.current.focus()
    }
  }
  const onScroll = (event) => {
    faker.current.scrollLeft = event.target.scrollLeft
    linker.current.scrollLeft = event.target.scrollLeft
  }
  useHighlightPrism([value])

  useEffect(() => {
    controller.current?.addEventListener('scroll', onScroll)
    return () => controller.current?.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className='query-editor query-input' onKeyDown={showLinks} onKeyUp={hideLinks}>
      <code ref={linker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? 'none'} links match-braces ${
          revealLinks ? 'show' : 'hide'
        }`}>{value}</code>
      <input
        ref={controller}
        className='controller coglib-prism-theme'
        value={value}
        onChange={onChange}
      />
      <code ref={faker} className={`language-${language ?? 'none'} display match-braces`}>{value}</code>
    </div>
  )
}
