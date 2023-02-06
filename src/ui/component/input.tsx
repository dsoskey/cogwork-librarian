import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import { Language } from '../../api/memory/syntaxHighlighting'

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
  React.useLayoutEffect(() => {
    Prism.highlightAll()
  }, [value])

  useEffect(() => {
    controller.current.addEventListener('scroll', onScroll)
    return () => controller.current.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className='query-editor' onKeyDown={showLinks} onKeyUp={hideLinks}>
      <pre
        ref={linker}
        tabIndex={-1}
        aria-hidden // Is this an accessibility issue with the links? also consider
        className={`language-${language ?? 'none'} links ${
          revealLinks ? 'show' : 'hide'
        }`}
      >
        <code className='match-braces'>{value}</code>
      </pre>
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
