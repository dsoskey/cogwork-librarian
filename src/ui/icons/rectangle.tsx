import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface RectangleIconProps extends BaseIconProps {
}

export function RectangleIcon(props: RectangleIconProps) {
  return <BaseIcon {...props} >
    <path d="M224 56v144a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8h176a8 8 0 0 1 8 8" opacity={DEFAULT_OPACITY} />
    <path
      d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 160H40V56h176z" />

  </BaseIcon>;
}