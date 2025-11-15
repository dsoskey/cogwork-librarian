import React, { ChangeEvent } from 'react'
import './checkbox.css'

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: React.ReactNode
  checkboxPosition?: 'start' | 'end'
  disabled?: boolean
}
export function Checkbox({ checkboxPosition = 'start', label, checked, onCheckedChange, disabled }: CheckboxProps) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    onCheckedChange(e.target.checked)

  const labelElement =
    typeof label === 'string' ? <span className='bold'>{label}</span> : label

  return (
    <label className={`row center ${disabled ? '' : 'pointer'}`}>
      {checkboxPosition === 'end' && labelElement}
      <input
        className='custom'
        type='checkbox'
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      {checkboxPosition === 'start' && labelElement}
    </label>
  )
}