import React from 'react'

export const DEFAULT_SIZE = '20';
export const DEFAULT_OPACITY = "0.5";

interface _BaseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  children: React.ReactNode;
}

export interface BaseIconProps extends Omit<_BaseIconProps, "children"> {
}

export function BaseIcon({ size = DEFAULT_SIZE, fill, className, children, transform }: _BaseIconProps) {
  return <svg
    xmlns='http://www.w3.org/2000/svg'
    className={className ? `themed-icon ${className}` : 'themed-icon'}
    width={size} height={size}
    viewBox='0 0 256 256'>
    <g fill={fill} className='stroke' transform={transform}>
      {children}
    </g>
  </svg>
}
