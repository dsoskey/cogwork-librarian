import React from 'react';
import "./twoPanelLayout.css"
import { Masthead } from '../component/masthead'

export function TwoPanelLayout({ className, leftChild, rightChild }) {
  // todo: draggable center line
  return <>
    <Masthead />
    <div className={`two-panel-layout ${className}`}>
      <div className="left-root">{leftChild}</div>
      <div style={{ width: "4px", height: "100%", backgroundColor: "var(--active)" }} />
      <div className="right-root">{rightChild}</div>
    </div>
  </>
}