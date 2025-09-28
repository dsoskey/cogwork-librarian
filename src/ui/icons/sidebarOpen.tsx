import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface SidebarOpenIconProps extends BaseIconProps {
}

export function SidebarOpenIcon(props: SidebarOpenIconProps) {

  return <BaseIcon {...props} transform="matrix(-1,0,0,1,256,0)">
    <path d='M88 48v160H40a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8Z' opacity={DEFAULT_OPACITY} />
    <path
      d='M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 152h16a8 8 0 0 0 0-16H40v-16h16a8 8 0 0 0 0-16H40V88h16a8 8 0 0 0 0-16H40V56h40v144H40Zm176 48H96V56h120z' />
  </BaseIcon>;
}

