import React, { useEffect, useState } from 'react'

export interface LoaderTextProps {
  text?: string
  timeout?: number
}
export function LoaderText({ text, timeout }: LoaderTextProps) {
  const [dots, setDots] = useState("...");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "") return "."
        if (prev === ".") return ".."
        if (prev === "..") return "..."
        if (prev === "...") return ""
      })
      return () => {
        clearInterval(interval);
      }
    }, timeout ?? 500)
  }, [timeout])

  return <>{text ?? "Loading"}{dots}</>
}