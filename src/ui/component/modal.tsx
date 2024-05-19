import React, { HTMLAttributes, useEffect, useRef } from 'react'
import './modal.css'

export interface ModalProps extends Omit<HTMLAttributes<HTMLDialogElement>, "title"> {
  open: boolean
  title: React.ReactNode
  children: React.ReactNode
  onClose: () => void
}
export const Modal = ({ onClose, title, open, children, className, ...dialogProps }: ModalProps) => {
  const modal = useRef<HTMLDialogElement>()
  const onEsc = (event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [])

  useEffect(() => {
    if (open) {
      modal.current?.showModal()
    } else {
      modal.current?.close()
    }
  }, [open])

  return (
    <dialog className={`modal ${className ?? ""}`} ref={modal} {...dialogProps}>
      <div className='row'>
        <div className='modal-title'>{title}</div>
        <button
          className='modal-close'
          aria-label='close modal'
          onClick={onClose}
        >
          X
        </button>
      </div>

      {children}
    </dialog>
  )
}
