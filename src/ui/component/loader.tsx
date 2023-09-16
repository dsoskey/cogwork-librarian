import React from 'react'

export interface LoaderProps {
  label?: string
  width: number | string
  count: number
  total: number
}

// should this be a <progress> instead of an svg?
export const Loader = ({ width, count, total, label }: LoaderProps) => {
  const viewHeight = 20
  const viewWidth = 400
  const rx = 4
  return (
    <svg
      className='loader'
      width={width}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect className='background' width={viewWidth} height={viewHeight} rx={rx} />
      <rect
        className='foreground'
        width={total === 0 ? 0 : (viewWidth * count) / total}
        height={viewHeight}
        rx={rx}
      />
      <rect
        className='foreground'
        x={rx}
        width={(total - rx) === 0 ? 0 : (viewWidth * count) / total - rx}
        height={viewHeight}
      />

      {label && <text x={4} y={viewHeight / 1.4} style={{ font: `14px monospace` }}>
        {count} / {total} {label}
      </text>}
    </svg>
  )
}
