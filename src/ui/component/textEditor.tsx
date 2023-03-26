import Prism from 'prismjs'
import React, { useEffect, useRef, useState } from 'react'
import { Language } from '../../api/memory/syntaxHighlighting'
import { SCORE_PRECISION, weightAlgorithms } from '../../api/queryRunnerCommon'

const MIN_TEXTAREA_HEIGHT = 32

export interface QueryInputProps {
  setQueries: React.Dispatch<React.SetStateAction<string[]>>
  queries: string[]
  onSubmit?: () => void
  renderQueryInfo?: (queries: string[]) => string[]
  placeholder?: string | undefined
  language?: Language
}
export const scoreInfo = (count: number) =>
  weightAlgorithms.zipf(count - 1).toPrecision(SCORE_PRECISION)
export const rankInfo = (count: number) =>
  count > 1 ? `${' '.repeat(4 - count.toString().length)}${count}` : 'SUB1'

export const renderQueryInfo =
  (renderSubquery: (count: number) => string = rankInfo) =>
  (queries: string[]): string[] => {
    if (queries.length === 0) {
      return []
    }
    const [_, ...rest] = queries
    let count = 1
    const result = ['BASE']
    rest.forEach((subQuery) => {
      if (
        subQuery.trimStart().startsWith('#') ||
        subQuery.trim().length === 0
      ) {
        result.push(' ')
      } else {
        result.push(renderSubquery(count))
        count += 1
      }
    })
    return result
  }

const linkKeys = ['Meta', 'Control']
export const TextEditor = ({
  queries,
  setQueries,
  onSubmit,
  renderQueryInfo,
  placeholder,
  language,
}: QueryInputProps) => {
  const separator = '\n'
  const value = queries.join(separator)
  const controller = useRef<HTMLTextAreaElement>()
  const brown = useRef<HTMLDivElement | undefined>()
  const faker = useRef<HTMLPreElement>()
  const linker = useRef<HTMLPreElement>()
  const [revealLinks, setRevealLinks] = useState<boolean>(false)

  const lineInfo =
    renderQueryInfo !== undefined ? renderQueryInfo(queries) : []
  const showLinks = (event) => {
    if (linkKeys.includes(event.key)) {
      setRevealLinks(true)
    }

    if (event.metaKey && event.key == "Enter") {
      onSubmit?.()
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
    if (brown.current) brown.current.style.height = 'inherit'
    linker.current.style.height = 'inherit'
    // Set height
    const newHeight = `${Math.max(
      controller.current.scrollHeight,
      MIN_TEXTAREA_HEIGHT
    )}px`
    controller.current.style.height = newHeight
    faker.current.style.height = newHeight
    if (brown.current) brown.current.style.height = newHeight
    linker.current.style.height = newHeight
    onScroll({ target: controller.current })
  }, [value])

  useEffect(() => {
    controller.current.addEventListener('scroll', onScroll)
    return () => controller.current.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className='query-editor' onKeyDown={showLinks} onKeyUp={hideLinks}>
      {renderQueryInfo !== undefined && (
        <pre tabIndex={-1} className='language-none labels'>
          {lineInfo.map((line, index) => <code key={index} onClick={() => {
            console.log("clicko!")
            const query = queries[index]
            const mindex = queries.slice(0, index).map(it => it.length)
              // the 1 accounts for \n
              .reduce((prev, next) => prev + next + 1, 0)
            // the 1 accounts for \n
            const maxdex = mindex + query.length + 1
            controller.current.focus()
            controller.current.setSelectionRange(mindex, maxdex)
          }}>{line}</code>)}
        </pre>
      )}
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
