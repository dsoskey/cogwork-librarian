import React, { HTMLAttributes, useState } from 'react'
import { TaskStatus } from '../../types'
import _isFunction from 'lodash/isFunction'
import { LinkIcon } from '../icons/link'
import { CheckIcon } from '../icons/check'
import { ErrorIcon } from '../icons/error'
import { CopyIcon } from '../icons/copy'

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

export const LINK_BUTTON_ICONS = {
  unstarted: <LinkIcon/>,
  success: <CheckIcon/>,
  error: <ErrorIcon/>,
}

export const COPY_BUTTON_ICONS = {
  unstarted: <CopyIcon/>,
  success: <CheckIcon/>,
  error: <ErrorIcon/>,
}


const DEFAULT_BUTTON_TEXT = {
  unstarted: 'copy to clipboard',
  success: 'copied successfully!',
  error: 'there was an error copying',
}

interface CopyToClipboardButtonProps extends HTMLAttributes<HTMLButtonElement> {
  copyText: string | (() => string)
  children?: React.ReactNode
  buttonText?: Partial<Record<TaskStatus, React.ReactNode>>
  titleText?: Partial<Record<TaskStatus, string>>
  className?: string
}
export const CopyToClipboardButton = ({ titleText, buttonText, copyText, className, children, ...rest }: CopyToClipboardButtonProps) => {
  const { status, onClick } = useCopyToClipboard(copyText);
  let content =  DEFAULT_BUTTON_TEXT[status];
  if (children) {
    content = children
  } else if (buttonText) {
    content = buttonText[status]
  }
  let title = rest.title
  if (titleText) {
    title = titleText[status] ?? "Copy to clipboard"
  }

  return <button
    {...rest}
    title={title}
    className={className}
    disabled={status !== 'unstarted'}
    onClick={onClick}
  >
    {content}
  </button>
}