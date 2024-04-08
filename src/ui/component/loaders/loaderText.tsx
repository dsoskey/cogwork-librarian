import React, { useEffect, useState } from 'react'


export const DOTS = ["...", "", ".", ".."]
export const CIRCLES = ["◔", "◑", "◕", "●", "○"]
export const TRIANGLES = ["▙", "▛" ,"▜", "▟"]
export const HEX = ["⬢", "⬣"]
export interface LoaderTextProps {
  text?: string
  timeout?: number
  frames?: string[]
}
export function LoaderText({ text, timeout, frames }: LoaderTextProps) {
  const _timeout = timeout ?? 500
  const _frames = frames ?? DOTS
  const [frameIndex, setFrameIndex] = useState<number>(0);
  useEffect(() => {
    let ignore = false
    let interval = setInterval(() => {
      if (ignore) return;
      setFrameIndex(prev => {
        if (prev === _frames.length - 1) {
          return 0;
        } else {
          return prev+1;
        }
      })
      return () => {
        ignore = true;
        clearInterval(interval);
        interval = null;
      }
    }, _timeout)
  }, [_timeout, _frames])

  return <>{text ?? "Loading"}{_frames[frameIndex]}</>
}