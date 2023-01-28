import { useEffect, useState } from 'react'

const calcWidth = () =>
  Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const calcHeight = () =>
  Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

export interface Viewport {
  width: number
  height: number
  desktop: boolean
  mobile: boolean
}

// Keep track of usages. if it gets big turn this into a context.
export const useViewportListener = (): Viewport => {
  const [width, setWidth] = useState(calcWidth)
  const [height, setHeight] = useState(calcHeight)
  const desktop = width >= 1024
  const mobile = width < 1024
  const listener = () => {
    setWidth(calcWidth)
    setHeight(calcHeight)
  }
  useEffect(() => {
    window.addEventListener('resize', listener)
    return () => {
      window.removeEventListener('resize', listener)
    }
  }, [])

  return {
    width,
    height,
    desktop,
    mobile,
  }
}
