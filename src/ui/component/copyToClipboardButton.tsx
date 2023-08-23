import React, { useState } from 'react'
import { TaskStatus } from '../../types'

const buttonText = {
  unstarted: 'copy to clipboard',
  success: 'copied successfully!',
  error: 'there was an error copying',
}

interface CopyToClipboardButtonProps {
  copyText: string
  className?: string
}
export const CopyToClipboardButton = ({ copyText, className }: CopyToClipboardButtonProps) => {
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
    {buttonText[clipboardStatus]}
  </button>
}