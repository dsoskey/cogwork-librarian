import React, { useState } from 'react'

export interface ExpanderProps {
  title: React.ReactNode
  children: React.ReactNode
}

export const Expander = ({ title, children }: ExpanderProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className='expander'>
      <button
        className='expander-action'
        onClick={() => setOpen((prev) => !prev)}
      >
        {title} {open ? 'V' : '>'}
      </button>
      {open && <div className='expander-child'>{children}</div>}
    </div>
  )
}
