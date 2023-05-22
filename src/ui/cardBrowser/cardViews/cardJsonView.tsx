import React from 'react'
import { EnrichedCard } from '../../../api/queryRunnerCommon'

export interface CardJsonViewProps {
  result: EnrichedCard[]
}
export const CardJsonView = ({ result }: CardJsonViewProps) => {

  return <pre>
    <code>
      {JSON.stringify(
        result.map((it) => it.data),
        null,
        4
      )}
    </code>
  </pre>
}