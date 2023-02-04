import React, { useEffect, useState } from 'react'
import { Viewport } from '../../viewport'

const cheeseSS = (dragging: boolean) => ({
  position: 'relative',
  top: 0,
  bottom: 0,
  left: 0,
  width: dragging ? 12 : 8,
  zIndex: 10,
  background: dragging ? 'var(--blue)' : 'var(--blue-mid-alpha)',
  transition: 'width 100ms ease-out, background 100ms ease-out',
  cursor: 'col-resize',
  fontSize: 10,
  flexBasis: 'auto',
})

interface ResizeHandleProps {
  onChange: (number) => void
  min: number
  max: number
  viewport: Viewport
}
export const ResizeHandle = ({
  viewport,
  onChange,
  min,
  max,
}: ResizeHandleProps) => {
  const [dragging, setDragging] = useState<boolean>(false)
  const onMouseDown = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  // handle dragging
  useEffect(() => {
    let frame
    const onMouseMove = (event) => {
      if (dragging) {
        const newWidth = viewport.width - event.pageX
        console.log(newWidth)
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(() => {
          onChange(Math.max(min, Math.min(max, newWidth)))
        })
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.cancelAnimationFrame(frame)
    }
  }, [dragging, min, max, onChange])

  // handle drag stop
  useEffect(() => {
    const onMouseUp = () => setDragging(false)
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  })

  return <div style={cheeseSS(dragging)} onMouseDown={onMouseDown} />
}
