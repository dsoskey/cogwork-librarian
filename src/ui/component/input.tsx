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
  placeholder?: string
}

export const Input = React.forwardRef<HTMLDivElement, InputProps>(({ value, onChange, language, placeholder, ...rest }: InputProps, parentRef) => {
  const controller = useRef<HTMLInputElement>()
  const faker = useRef<HTMLPreElement>()
  const linker = useRef<HTMLPreElement>()
  const [revealLinks, setRevealLinks] = useState<boolean>(false)
  const onScroll = (event) => {
    faker.current.scrollLeft = event.target.scrollLeft
    linker.current.scrollLeft = event.target.scrollLeft
  }
  useHighlightPrism([value, revealLinks, language]);
  React.useLayoutEffect(() => {
    if (revealLinks) {
      linker.current?.querySelectorAll('a').forEach(qs => {
        qs.tabIndex = 0;
      })
    } else {
      linker.current?.querySelectorAll('a').forEach(qs => {
        qs.tabIndex = -1;
      })
    }
  })

  useEffect(() => {
    controller.current?.addEventListener('scroll', onScroll)
    return () => controller.current?.removeEventListener('scroll', onScroll)
  }, [])

  const handleDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
      setRevealLinks(prev => !prev)
      if (revealLinks) {
        controller.current.focus()
      } else {
        linker.current?.focus()
      }
    }
  }
  const displayValue = value.length > 0 ? value : placeholder

  return (
    <div className='text-editor-root query-input' onKeyDown={handleDown} ref={parentRef}>
      <input
        {...rest}
        ref={controller}
        className={`controller coglib-prism-theme ${rest.className}`}
        value={value}
        onChange={onChange}
      />
      {revealLinks && <pre
        ref={linker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? 'none'}-links links show`}
      >
        <code>{displayValue}</code>
      </pre>}
      <pre
        ref={faker}
        tabIndex={-1}
        aria-hidden
        className={`language-${language ?? 'none'} display`}
      >
        <code>{displayValue}</code>
      </pre>
    </div>
  )
})
