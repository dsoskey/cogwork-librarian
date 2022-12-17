import React from 'react'
import { QueryInputProps } from "./dndInput"

export const QueryTextEditor = ({ queries, setQueries }: QueryInputProps) => {
    return <textarea
        rows={queries.length}
        value={queries.join("\n")}
        onChange={(event) => {
            setQueries(event.target.value.split("\n"))
        }} 
    />
}