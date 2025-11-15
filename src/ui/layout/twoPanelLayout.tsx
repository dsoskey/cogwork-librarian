import React, { useEffect, useState } from 'react';
import "./twoPanelLayout.css"
import { Masthead } from '../component/masthead'
import { ResizeHandle } from '../component/resizeHandle'
import { useViewportListener } from '../hooks/useViewportListener'

export interface TwoPanelLayoutProps {
  className?: string
  lChild: React.ReactElement
  rInitialWidth?: (width: number) => number
  rChild: React.ReactElement
}

export function TwoPanelLayout({ className, lChild, rInitialWidth, rChild }: TwoPanelLayoutProps) {
  const viewport = useViewportListener()
  const [widthRight, setWidthRight] = useState(rInitialWidth
    ? rInitialWidth(viewport.width)
    : viewport.width / 2)
  const widthLeft = viewport.width - widthRight;

  const handleChange = (width: number) => {
    setWidthRight(width);
  }

  return <>
    <Masthead />
    <div className={`two-panel-layout ${className}`}>
      <div className="left-root" style={{width: widthLeft}} >{lChild}</div>
      <ResizeHandle
        onChange={handleChange}
        viewport={viewport}
        min={viewport.width/2}
        max={viewport.width*3/4}
      />
      <div className="right-root" style={{width: widthRight}}>{rChild}</div>
    </div>
  </>
}