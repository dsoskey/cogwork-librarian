import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface RefreshIconProps extends BaseIconProps {
}

export function RefreshIcon(props: RefreshIconProps) {
  return <BaseIcon {...props}>
      <path d="M216 128a88 88 0 1 1-88-88a88 88 0 0 1 88 88" opacity={DEFAULT_OPACITY} />
      <path
        d="M240 56v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h27.4l-26.59-24.36l-.25-.24a80 80 0 1 0-1.67 114.78a8 8 0 0 1 11 11.63A95.44 95.44 0 0 1 128 224h-1.32a96 96 0 1 1 69.07-164L224 85.8V56a8 8 0 1 1 16 0" />
    </BaseIcon>;
}

