import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface CopyIconProps extends BaseIconProps {
}

export function CopyIcon(props: CopyIconProps) {
  return <BaseIcon {...props}>
    <path d="M184 72v144H40V72Z" opacity={DEFAULT_OPACITY} />
    <path
      d="M184 64H40a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8m-8 144H48V80h128Zm48-168v144a8 8 0 0 1-16 0V48H72a8 8 0 0 1 0-16h144a8 8 0 0 1 8 8" />
  </BaseIcon>;
}
