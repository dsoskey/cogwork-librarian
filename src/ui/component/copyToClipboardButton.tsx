import React, { useState } from 'react'
import { TaskStatus } from '../../types'

const buttonText = {
  unstarted: 'copy to clipboard',
  success: 'copied successfully!',
  error: 'there was an error copying',
}

interface CopyToClipboardButtonProps {
  copyText: string
  children?: React.ReactNode
  className?: string
}
export const CopyToClipboardButton = ({ copyText, className, children }: CopyToClipboardButtonProps) => {
  const [clipboardStatus, setClipboardStatus] =
    useState<TaskStatus>('unstarted')

  return <button
    className={className}
    disabled={clipboardStatus !== 'unstarted'}
    onClick={() => {
      navigator.clipboard
        .writeText(copyText)
        .then(() => {
          setClipboardStatus('success')
          setTimeout(() => {
            setClipboardStatus('unstarted')
          }, 3000)
        })
        .catch(() => {
          setClipboardStatus('error')
        })
    }}
  >
    {children ?? buttonText[clipboardStatus]}
  </button>
}