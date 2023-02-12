import React from 'react'
import { Setter } from '../../types'

export interface ExpanderButtonProps {
  label?: string
  open: boolean
  setOpen: Setter<boolean>
}
export const ExpanderButton = ({
  label,
  open,
  setOpen,
}: ExpanderButtonProps) => (
  <button
    onClick={() => setOpen((prev) => !prev)}
    aria-label={`${open ? 'hide' : 'show'} ${label ?? 'content'}`}
  >
    {open ? 'hide' : 'show'}
  </button>
)
