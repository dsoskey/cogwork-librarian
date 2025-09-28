import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'
import React from 'react'

export interface SidebarClosedIconProps extends BaseIconProps {
}

export function SidebarClosedIcon(props: SidebarClosedIconProps) {

  return <BaseIcon {...props} transform="matrix(-1,0,0,1,256,0)">
    <path
      d="M 60,48 V 208 L 36,208 A 8,4 90 0 1 32,200 V 56 a 8,3 90 0 1 4,-8 z"
      opacity={DEFAULT_OPACITY} />
    <path
      d="M 216,40 H 40 c -8.836556,0 -16,7.163444 -16,16 v 144 c 0,8.83656 7.163444,16 16,16 h 176 c 8.83656,0 16,-7.16344 16,-16 V 56 c 0,-8.836556 -7.16344,-16 -16,-16 M 40,56 H 58 V 200 H 40 Z M 216,200 H 74 V 56 h 142 z"
       />
  </BaseIcon>;
}