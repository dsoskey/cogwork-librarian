import React, { useContext, useState } from 'react'
import { Modal } from './component/modal'
import { FlagContext, Flag } from './flags'
import { LexerTester } from './lexerTester'

export const AdminPanel = ({ children }) => {
  const { flags, setFlag } = useContext(FlagContext)
  const [open, setOpen] = useState(false)
  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)


  return <div>
    <span onClick={onOpen}>{children}</span>
    <Modal open={open} title={<h2>super secret admin panel activate!</h2>} onClose={onClose}>
      <h3>flag control</h3>
      <p className='alert'>disclamer: the feature flags on this page change the applications behavior. some of these features are unreleased, and using them could potentially break your application or database. use at your own risk!</p>
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
    </Modal>
  </div>
}