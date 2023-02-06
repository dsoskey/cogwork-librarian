import Prism from 'prismjs'
import React, { useEffect, useRef, useState } from 'react'
import { Language } from '../../api/memory/syntaxHighlighting'

const MIN_TEXTAREA_HEIGHT = 32

export interface QueryInputProps {
  setQueries: React.Dispatch<React.SetStateAction<string[]>>
  queries: string[]
  placeholder?: string | undefined
  language?: Language
}

const linkKeys = ['Meta', 'Control']
export const TextEditor = ({
  queries,
  setQueries,
  placeholder,
  language,
}: QueryInputProps) => {
  const separator = '\n'
  const value = queries.join(separator)
  const controller = useRef<HTMLTextAreaElement>()
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
    faker.current.scrollTop = event.target.scrollTop
    linker.current.scrollLeft = event.target.scrollLeft
    linker.current.scrollTop = event.target.scrollTop
  }

  React.useLayoutEffect(() => {
    Prism.highlightAll()

    // Shamelessly stolen from https://stackoverflow.com/a/65990608
    // Reset height - important to shrink on delete
    controller.current.style.height = 'inherit'
    faker.current.style.height = 'inherit'
    linker.current.style.height = 'inherit'
    // Set height
    const newHeight = `${Math.max(
      controller.current.scrollHeight,
      MIN_TEXTAREA_HEIGHT
    )}px`
    controller.current.style.height = newHeight
    faker.current.style.height = newHeight
    linker.current.style.height = newHeight
    onScroll({ target: controller.current })
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
      <textarea
        ref={controller}
        className='controller coglib-prism-theme'
        value={value}
        placeholder={placeholder}
        spellCheck={false}
        onChange={(event) => {
          setQueries(event.target.value.split(separator))
        }}
      />

      <pre
        ref={faker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? 'none'} display`}
      >
        <code className='match-braces'>{value}</code>
      </pre>
    </div>
  )
}
