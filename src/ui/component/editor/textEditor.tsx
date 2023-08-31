import React, { useEffect, useRef, useState } from 'react'
import { Language, useHighlightPrism } from '../../../api/local/syntaxHighlighting'
import { MultiQueryActionBar } from './multiQueryActionBar'
import { ok, Result } from 'neverthrow'

const MIN_TEXTAREA_HEIGHT = 32
const LINK_KEYS = ['Meta', 'Control']

export const findQueryIndex = (value: string, cursorIndex: number): Result<number, Error> => {
  let result = 0

  // +1 includes character after the cursor
  const before = value.substring(0, cursorIndex + 1).split('\n')
  const valueByLine = value.split('\n')
  let index = before.length - 1
  while(index > 0 && result === 0) {
    const currentLine = before[index].trim()
    const previousLine = before[index-1].trim()

    if (currentLine.length > 0 && previousLine.length === 0) {
      if (!currentLine.startsWith("#")) {
        return ok(index)
      } else {
        let forwardSearchIndex = index
        while (forwardSearchIndex < valueByLine.length - 1 && result === 0) {
          const nextLine = valueByLine[forwardSearchIndex + 1].trim()
          if (nextLine.startsWith("#")) {
            forwardSearchIndex++
          } else {
            return ok(forwardSearchIndex + 1)
          }
        }
      }
    }
    index--
  }
  return ok(result)
}

export const getLineIndex = (value: string, index: number, lineBreak: string = "\n"): number => {
  let result = 0;
  let searchIndex = 0;
  while(searchIndex !== -1 && searchIndex < index) {
    searchIndex = value.indexOf(lineBreak, searchIndex)
    if (searchIndex !== -1 && searchIndex < index) {
      result++
      searchIndex++
    }
  }

  return result;
}

export interface QueryInputProps {
  setQueries: React.Dispatch<React.SetStateAction<string[]>>
  queries: string[]
  onSubmit?: (baseIndex: number) => void
  canSubmit?: boolean
  placeholder?: string | undefined
  language?: Language
  disabled?: boolean
}

export const TextEditor = ({
  queries,
  setQueries,
  onSubmit,
  canSubmit,
  placeholder,
  language,
  disabled,
}: QueryInputProps) => {
  const separator = '\n'
  const value = queries.join(separator)
  const controller = useRef<HTMLTextAreaElement>()
  const faker = useRef<HTMLPreElement>()
  const linker = useRef<HTMLPreElement>()
  const [revealLinks, setRevealLinks] = useState<boolean>(false)

  const showLinks = (event) => {
    if (LINK_KEYS.includes(event.key)) {
      setRevealLinks(true)
    }

    if (event.metaKey || event.ctrlKey) {
      if (event.key == "Enter") {
        let baseIndex = 0
        const cursorIndex = controller.current.selectionStart ?? 0
        const queryIndex = findQueryIndex(value, cursorIndex)
        if (queryIndex.isOk()) {
          baseIndex = queryIndex._unsafeUnwrap()
        } else {
          console.warn("cursor not on a query")
        }
        if (canSubmit) {
          onSubmit?.(baseIndex)
        }
      }
    }
  }
  const hideLinks = (event) => {
    if (LINK_KEYS.includes(event.key)) {
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

  const copyText = (mindex: number, maxdex: number) => {
    controller.current.focus()
    controller.current.setSelectionRange(mindex, maxdex)
  }

  useHighlightPrism([value, language])
  React.useLayoutEffect(() => {

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
    return () => controller.current?.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className='query-editor' onKeyDown={showLinks} onKeyUp={hideLinks}>
      <MultiQueryActionBar
        queries={queries}
        copyText={copyText}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
      />
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
        disabled={disabled}
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
