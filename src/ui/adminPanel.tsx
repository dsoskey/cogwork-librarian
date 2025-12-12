import React, { useContext, useState } from 'react'
import { Modal } from './component/modal'
import { FlagContext, Flag } from './flags'
import { LexerTester } from './lexerTester'
import { Alert } from './component/alert/alert'
import { ADMIN_PANEL_ALERT_TEXT } from '../strings'

export const AdminPanel = ({ children }) => {
  const { flags, setFlag } = useContext(FlagContext)
  const [open, setOpen] = useState(false)
  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)


  return <div>
    <span onClick={onOpen}>{children}</span>
    {open && <Modal open={open} title={<h2>super secret admin panel activate!</h2>} onClose={onClose}>
      <h3>flag control</h3>
      <Alert>{ADMIN_PANEL_ALERT_TEXT}</Alert>
      <div className='column'>
        {Object.keys(flags).map((flag: Flag) => {
          if (flag === 'adminMode') {
            return null
          }
          return <label key={flag}>
            <input type='checkbox' checked={flags[flag]} onChange={() => setFlag(flag, !flags[flag])} />
            {" "}{flag}
          </label>
        })}
      </div>

      <h3>lexer tester</h3>
      <LexerTester />
    </Modal>}
  </div>
}