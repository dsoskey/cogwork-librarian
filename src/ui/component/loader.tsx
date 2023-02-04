import React from 'react'

export interface LoaderProps {
  label: string
  width: number
  count: number
  total: number
}
export const Loader = ({ width, count, total, label }: LoaderProps) => {
  const height = 20
  const rx = 4
  return (
    <svg
      className='loader'
      viewBox={`0 0 ${width} ${height}`}
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect className='background' width={width} height={height} rx={rx} />
      <rect
        className='foreground'
        width={(width * count) / total}
        height={height}
        rx={rx}
      />
      <rect
        className='foreground'
        x={rx}
        width={(width * count) / total - rx}
        height={height}
      />

      <text x={4} y={height / 1.4} style={{ font: `14px monospace` }}>
        {count} / {total} {label}
      </text>
    </svg>
  )
}
