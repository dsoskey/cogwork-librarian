// heavily inspired by https://css-tricks.com/animation-techniques-for-adding-and-removing-items-from-a-stack/
import React, { createContext, useContext, useLayoutEffect, useRef } from 'react'
import "./toaster.css"

export const DISMISS_TIMEOUT_MS = 5000
export interface ToasterMessage {
  id: string
  text: string
  dismissible?: boolean
}

export interface ToasterController {
  messages: ToasterMessage[]
  addMessage: (text: string, dismissible: boolean) => string
  dismissMessage: (messageId: string) => void
}

export const ToasterContext = createContext<ToasterController>({
  messages: [],
  addMessage: () => {
    console.error("called ToasterContext.addMessage without a provider")
    return ""
  },
  dismissMessage: () => console.error("called ToasterContext.dismissMessage without a provider"),
})


const ToastyMessage = ({ message, dismissMessage }) => {
  const container = useRef<HTMLDivElement>()
  const messageElement = useRef<HTMLDivElement>()
  useLayoutEffect(() => {
    setTimeout(() => {
      const height = messageElement.current.getBoundingClientRect().height
      console.log(`message height: ${height}`)
      container.current.style.height = `${height}px`
      container.current.style.transform = "transition: all 0.6s ease-out"
      container.current?.classList.add("show")
      messageElement.current?.classList.add("show")
    }, 15)
  }, [])

  const dismiss = () => {
    container.current.style.height = "0"
    container.current?.classList.remove("show")
    messageElement.current?.classList.remove("show")
    setTimeout(() => dismissMessage(message.id), 15)
  }

  return <div className='message-container' ref={container}>
    <div className='toaster-message' ref={messageElement}>
      <div>{message.text}</div>
      {message.dismissible && <button
        title='close message'
        onClick={dismiss}
      >
        X
      </button>}
    </div>
  </div>
}

export const Toaster = () => {
  const { messages, dismissMessage } = useContext(ToasterContext)

  return <div className='toaster' aria-live="assertive">
    {messages.map(message => <ToastyMessage key={message.id} message={message} dismissMessage={dismissMessage} />)}
  </div>
}