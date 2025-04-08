import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface AddIconProps extends BaseIconProps {
}

export function AddIcon(props: AddIconProps) {
  return <BaseIcon {...props} >
    <path d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity={DEFAULT_OPACITY} />
    <path
      d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m48-88a8 8 0 0 1-8 8h-32v32a8 8 0 0 1-16 0v-32H88a8 8 0 0 1 0-16h32V88a8 8 0 0 1 16 0v32h32a8 8 0 0 1 8 8" />
  </BaseIcon>;
}