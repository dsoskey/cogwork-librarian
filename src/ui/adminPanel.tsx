import React, { useContext, useState } from 'react'
import { Modal } from './component/modal'
import { Flag, FLAG_NAMES, FlagContext } from '../flags'

export const AdminPanel = () => {
  const { flags, setFlag } = useContext(FlagContext)
  const [open, setOpen] = useState(false)
  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)


  return <div>
    <button onClick={onOpen}>admin panel</button>
    <Modal open={open} title={<h2>super secret admin panel activate!</h2>} onClose={onClose}>
      <h3>flag control</h3>
      {Object.keys(FLAG_NAMES).map((flag: Flag) => {
        if (flag === 'adminMode') {
          return null
        }
        return <label key={flag}>
          <input type='checkbox' checked={flags[flag]} onChange={() => setFlag(flag, !flags[flag])} />
          {" "}{flag}
        </label>
      })}
    </Modal>
  </div>
}