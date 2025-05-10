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
  useHighlightPrism([value]);

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
  const displayValue = value.length > 0 ? value : placeholder

  return (
    <div className='text-editor-root query-input' onKeyDown={handleDown} ref={parentRef}>
      <pre ref={linker}
           tabIndex={-1}
           aria-hidden
           className={`language-${language ?? 'none'} links match-braces ${
             revealLinks ? 'show' : 'hide'
           }`}
      ><code>{displayValue}</code></pre>
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
        <code>{displayValue}</code></pre>
    </div>
  )
})
