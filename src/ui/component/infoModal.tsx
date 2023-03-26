import React, { useState } from 'react'
import { Modal } from './modal'

interface InfoModalProps {
  title: React.ReactNode
  info: React.ReactNode
}
export const InfoModal = ({ title, info }: InfoModalProps) => {
  const [open, setOpen] = useState(false)

  return <span className='info-modal'>
    <button onClick={() => setOpen(true)}>?</button>
    <Modal open={open} title={title} onClose={() => setOpen(false)}>
      {info}
    </Modal>
  </span>
}