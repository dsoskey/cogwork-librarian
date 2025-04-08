import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface CheckIconProps extends BaseIconProps {
}

export function CheckIcon(props: CheckIconProps) {
  return <BaseIcon {...props}>
      <path d="M224 128a96 96 0 1 1-96-96a96 96 0 0 1 96 96" opacity={DEFAULT_OPACITY} />
      <path
        d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88" />
    </BaseIcon>;
}

