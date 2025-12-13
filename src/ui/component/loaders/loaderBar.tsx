import React from 'react'

export interface LoaderProps {
  label?: string
  width: number;
  height?: number;
  count: number
  total: number
  className?: string;
}

// should this be a <progress> instead of an svg?
export const LoaderBar = ({ width, height = 20, count, total, label, className = "", }: LoaderProps) => {
  const viewHeight = height;
  const viewWidth = width;
  const rx = 4
  return (
    <svg
      className={`loader ${className}`}
      width={width} height={height}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect
        className='background'
        width={viewWidth}
        height={viewHeight}
        rx={rx}
      />
      <rect
        className='foreground'
        width={total === 0 ? 0 : (viewWidth * count) / total}
        height={viewHeight}
        rx={rx}
      />
      <rect
        className='foreground'
        rx={rx}
        width={(total - rx) === 0 ? 0 : (viewWidth * count) / total - rx}
        height={viewHeight}
      />

      {label && <text x={4} y={viewHeight / 1.4} style={{ font: `14px monospace` }}>
        {count} / {total} {label}
      </text>}
    </svg>
  )
}
