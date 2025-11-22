// heavily inspired by https://css-tricks.com/animation-techniques-for-adding-and-removing-items-from-a-stack/
import React, { createContext, useCallback, useContext, useState } from 'react'
import './toaster.css'
import { v4 as uuidv4 } from 'uuid'
import { AnimatePresence, motion } from 'motion/react'

export const DISMISS_TIMEOUT_MS = 5000

export interface ToasterMessage {
  id: string
  text: string
  dismissible?: boolean
}

export interface MessageOptions {
  /** adds a dismiss button. */
  dismissible?: boolean;
  /** autmatically dismiss message after N milliseconds. */
  dismissAfterMs?: number
}

export const DEFAULT_OPTIONS: MessageOptions = {
  dismissAfterMs: DISMISS_TIMEOUT_MS,
  dismissible: false,
}

export interface ToasterController {
  messages: ToasterMessage[]
  addMessage: (text: string, options?: MessageOptions) => string
  dismissMessage: (messageId: string) => void
}


export function useToaster(): ToasterController {
  const [messages, setMessages] = useState<ToasterMessage[]>([])
  const dismissMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(it => it.id !== messageId))
  }, [setMessages])
  const addMessage = useCallback((text: string, options: MessageOptions = DEFAULT_OPTIONS) => {
    const { dismissible, dismissAfterMs } = options
    const message: ToasterMessage = { id: uuidv4(), text, dismissible }
    setMessages(prev => [...prev, message])
    if (dismissAfterMs) {
      setTimeout(() => {
        dismissMessage(message.id)
      }, dismissAfterMs)
    }
    return message.id
  }, [setMessages])
  return { messages, addMessage, dismissMessage }
}

export const ToasterContext = createContext<ToasterController>({
  messages: [],
  addMessage: () => {
    console.error('called ToasterContext.addMessage without a provider')
    return ''
  },
  dismissMessage: () => console.error('called ToasterContext.dismissMessage without a provider')
})


function ToastyMessageNew({ message, dismissMessage }) {
  const dismiss = () => {
    dismissMessage(message.id)
  }

  return <motion.div
    className={'toaster-message' as const}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div>{message.text}</div>
    {message.dismissible && <button
      title='close message'
      onClick={dismiss}
    >
      X
    </button>}
  </motion.div>
}

export const Toaster = () => {
  const { messages, dismissMessage } = useContext(ToasterContext)

  return <div className='toaster' aria-live='assertive'>
    <AnimatePresence>
      {messages.map(message =>
        <ToastyMessageNew
          key={message.id}
          message={message}
          dismissMessage={dismissMessage}
        />
      )}
    </AnimatePresence>
  </div>
}

