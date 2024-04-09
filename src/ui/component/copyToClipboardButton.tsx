import React, { HTMLAttributes, useState } from 'react'
import { TaskStatus } from '../../types'

const DEFAULT_BUTTON_TEXT = {
  unstarted: 'copy to clipboard',
  success: 'copied successfully!',
  error: 'there was an error copying',
}

interface CopyToClipboardButtonProps extends HTMLAttributes<HTMLButtonElement> {
  copyText: string
  children?: React.ReactNode
  buttonText?: Partial<Record<TaskStatus, React.ReactNode>>
  className?: string
}
export const CopyToClipboardButton = ({ buttonText, copyText, className, children, ...rest }: CopyToClipboardButtonProps) => {
  const [clipboardStatus, setClipboardStatus] =
    useState<TaskStatus>('unstarted')

  return <button
    {...rest}
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
    {children ?? buttonText[clipboardStatus] ?? DEFAULT_BUTTON_TEXT[clipboardStatus]}
  </button>
}