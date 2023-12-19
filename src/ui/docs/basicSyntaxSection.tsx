import React from 'react'
import { MDDoc } from './renderer'
import "./basicSyntaxSection.css";
interface BasicSyntaxSectionProps {
  textMd: string;
  exampleMd: string;
}
export const BasicSyntaxSection = ({ textMd, exampleMd }: BasicSyntaxSectionProps) => {
  const [title, ...rest] = textMd.split("\n\n")
  return <>
    <MDDoc>{title}</MDDoc>
    <div className='basic-syntax-root'>
      <div><MDDoc>{rest.join("\n\n")}</MDDoc></div>
      <MDDoc className='example'>{exampleMd}</MDDoc>
    </div>
  </>
}