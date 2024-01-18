import React from 'react'
import "./formField.css"

interface FormFieldProps {
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
}
export const FormField = ({ title, description, children }: FormFieldProps) => {

  return <label className='form-field'>
    <div className='title'>{title}</div>
    {description && <div className='description'>{description}</div>}
    {children}
  </label>
}