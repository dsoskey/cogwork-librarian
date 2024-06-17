import React, { HTMLAttributes, useState } from 'react'
import { TaskStatus } from '../../types'
import _isFunction from 'lodash/isFunction'

export function useCopyToClipboard(copyText: (() => string) | string) {
  const [status, setStatus] =
    useState<TaskStatus>('unstarted')

  const onClick = () => {
    const text = _isFunction(copyText) ? copyText() : copyText;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setStatus('success')
        setTimeout(() => {
          setStatus('unstarted')
        }, 3000)
      })
      .catch(() => {
        setStatus('error')
      })
  }

  return { onClick, status }
}

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
  const { status, onClick } = useCopyToClipboard(copyText);
  let content =  DEFAULT_BUTTON_TEXT[status];
  if (children) {
    content = children
  } else if (buttonText) {
    content = buttonText[status]
  }

  return <button
    {...rest}
    className={className}
    disabled={status !== 'unstarted'}
    onClick={onClick}
  >
    {content}
  </button>
}