import React, { useRef } from 'react'
import './contextMenu.css'
import { CubeContextMenu } from './cubeContextMenu'

const CONTEXT_MENU_ID = "context-menu"

export interface ContextMenuProps {
  contextKey: string
  // contextType?: string
}

export function ContextMenu({ contextKey }: ContextMenuProps) {

  const self = useRef<HTMLDivElement>(null)

  const handleLinkClick = () => {
    self.current.style.display = 'none'
  }
  return <div ref={self} id={CONTEXT_MENU_ID} tabIndex={0}>
    <CubeContextMenu cubeKey={contextKey} handleLinkClick={handleLinkClick} />
  </div>
}

export function openContextMenu(x: number, y: number, id: string =  CONTEXT_MENU_ID) {
  const element = document.getElementById(id)
  element.style.display = "block";
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.focus();
}

export function closeContextMenu(id: string = CONTEXT_MENU_ID) {
  const element = document.getElementById(id)
  element.style.display = "none";
}

export function handleClickOutsideContextMenu(event: React.MouseEvent<HTMLDivElement>) {
  const contextMenu = document.getElementById(CONTEXT_MENU_ID);
  const contextMenuHasFocus = contextMenu.contains(event.target as Element)
  if (!contextMenuHasFocus) {
    closeContextMenu();
  }
}