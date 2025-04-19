import React from 'react'

export const DEFAULT_SIZE = '18';
export const DEFAULT_OPACITY = "0.5";

interface _BaseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  children: React.ReactNode;
}

export interface BaseIconProps extends Omit<_BaseIconProps, "children"> {
}

export function BaseIcon({ size, fill, className, children }: _BaseIconProps) {
  const _size = size ?? DEFAULT_SIZE;
  return <svg
    xmlns='http://www.w3.org/2000/svg'
    className={className ? `themed-icon ${className}` : 'themed-icon'}
    width={_size} height={_size}
    viewBox='0 0 256 256'>
    <g fill={fill} className='stroke'>
      {children}
    </g>
  </svg>
}
