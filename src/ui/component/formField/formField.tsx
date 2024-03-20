import React from 'react'
import "./formField.css"

interface FormFieldProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}
export const FormField = ({ title, description, children, className }: FormFieldProps) => {
  return <label className={`form-field ${className}`}>
    <div className='title'>{title}</div>
    {description && <div className='description'>{description}</div>}
    {children}
  </label>
}

export const RangeField = ({ className, title, description, children }: FormFieldProps) => {
  return <label className={`${className} form-field range`}>
    <div className='title'>
      <span>{title}</span>
      {children}
    </div>
    {description && <div className='description'>{description}</div>}
  </label>
}