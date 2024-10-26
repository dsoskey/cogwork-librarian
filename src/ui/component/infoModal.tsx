import React, { useState } from 'react'
import { Modal } from './modal'

interface InfoModalProps {
  title: React.ReactNode
  info: React.ReactNode
  buttonContent?: React.ReactNode
}
export const InfoModal = ({ title, info, buttonContent }: InfoModalProps) => {
  const [open, setOpen] = useState(false)

  return <span className='info-modal'>
    <button onClick={() => setOpen(true)}>{buttonContent ?? "?"}</button>
    <Modal open={open} title={title} onClose={() => setOpen(false)}>
      {info}
    </Modal>
  </span>
}