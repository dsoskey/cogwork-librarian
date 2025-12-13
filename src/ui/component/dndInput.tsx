import React from 'react'

export interface QueryInputProps {
  setQueries: React.Dispatch<React.SetStateAction<string[]>>
  queries: string[]
}

/**
 * @deprecated for now. Will revive upon demand and once i better understand what i want it to look like
 */
export const DnDInput = ({ setQueries, queries }: QueryInputProps) => {
  return (
    <div>
      {queries.map((query, index) => (
        <div key={index}>
          <input
            className='query-input'
            value={query}
            onChange={(event) =>
              setQueries((prev) => {
                const newQ = structuredClone(prev)
                newQ[index] = event.target.value
                return newQ
              })
            }
          />
          <button
            onClick={() => {
              setQueries((prev) => {
                const newQ = structuredClone(prev)
                newQ.splice(index, 1)
                return newQ
              })
            }}
          >
            remove query
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          setQueries((prev) => {
            const newQ = structuredClone(prev)
            newQ.push('')
            return newQ
          })
        }}
      >
        add query
      </button>
    </div>
  )
}
