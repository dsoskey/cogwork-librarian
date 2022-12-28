import Prism from 'prismjs'
import React, { useRef } from 'react'
import { QueryInputProps } from "./dndInput"
const MIN_TEXTAREA_HEIGHT = 32;
export const QueryTextEditor = ({ queries, setQueries }: QueryInputProps) => {
    const value = queries.join("\n")
    const controller = useRef<HTMLTextAreaElement>()
    const faker = useRef<HTMLPreElement>()

    React.useLayoutEffect(() => {
        Prism.highlightAll()
        
        // Shamelessly stolen from https://stackoverflow.com/a/65990608
        // Reset height - important to shrink on delete
        controller.current.style.height = "inherit"
        faker.current.style.height = "inherit"
        // Set height
        const newHeight = `${Math.max(
            controller.current.scrollHeight,
            MIN_TEXTAREA_HEIGHT
          )}px`
        controller.current.style.height = newHeight
        faker.current.style.height = `${Math.max(
            controller.current.scrollHeight,
            MIN_TEXTAREA_HEIGHT
          )}px`;
      }, [value]);

    return <div className='query-editor'>
        <textarea
            ref={controller}
            className="controller"
            value={value}
            onChange={(event) => {
                setQueries(event.target.value.split("\n"))
            }} 
        />
        <pre ref={faker} tabIndex={-1} className="language-regex display"><code className="match-braces">
            {value}
        </code></pre>
    </div>
}