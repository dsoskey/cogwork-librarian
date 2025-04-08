import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface BlockIconProps extends BaseIconProps {
}

export function BlockIcon(props: BlockIconProps) {
  return <BaseIcon {...props}>
    <path d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity={DEFAULT_OPACITY} />
    <path
      d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m88 104a87.56 87.56 0 0 1-20.41 56.28L71.72 60.4A88 88 0 0 1 216 128m-176 0a87.56 87.56 0 0 1 20.41-56.28L184.28 195.6A88 88 0 0 1 40 128" />
  </BaseIcon>;
}
