import React, { useRef, useState } from 'react'
import "./dropdown.css"

export interface DropdownProps {
  children: React.ReactNode
  options: (close: () => void) => React.ReactNode
  className?: string
}
export function Dropdown({ children, options, className }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>()
  const [expanded, setExpanded] = useState<boolean>(false)
  return <div ref={dropdownRef} className='dropdown' onBlur={e => {
    if (!(e.relatedTarget && dropdownRef.current?.contains(e.relatedTarget))) {
      setExpanded(false);
    }
  }}>
    <div className={`dropdown-controls ${className}`}>
      {children}
      <button className='expander-button' onClick={() => setExpanded(prev => !prev)}>
        {expanded ? '▲' : '▼'}
      </button>
    </div>
    {expanded && <div className='dropdown-container'>
      {options(()=>setExpanded(false))}
    </div>}
  </div>
}