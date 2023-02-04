import React, { useEffect } from 'react'
import './modal.css'
export interface ModalProps {
  open: boolean
  title: React.ReactNode
  children: React.ReactNode
  onClose: () => void
}
export const Modal = ({ onClose, title, open, children }: ModalProps) => {
  const onEsc = (event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  })

  return (
    <div className={`modal display-${open ? 'block' : 'none'}`}>
      <dialog className='modal-main' open={open}>
        <div className='row'>
          <div className='modal-title'>{title}</div>
          <button className='modal-close' type='button' onClick={onClose}>
            X
          </button>
        </div>

        {children}
      </dialog>
    </div>
  )
}
