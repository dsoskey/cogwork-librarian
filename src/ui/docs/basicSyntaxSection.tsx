import React from 'react'
import { MDDoc } from './renderer'
import "./basicSyntaxSection.css";
interface BasicSyntaxSectionProps {
  textMd: string;
  exampleMd: string;
}
export const BasicSyntaxSection = ({ textMd, exampleMd }: BasicSyntaxSectionProps) => {
  return <div className='basic-syntax-root'>
    <MDDoc>{textMd}</MDDoc>
    <MDDoc className='example'>{exampleMd}</MDDoc>
  </div>
}