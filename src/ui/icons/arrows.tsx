import React from "react";
import { BaseIcon, BaseIconProps, DEFAULT_OPACITY } from './base'

export interface ArrowOutIconProps extends BaseIconProps {
}

export function ArrowOutIcon(props: ArrowOutIconProps) {
  return <BaseIcon {...props} >
    <path d='M224 48v160a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16'
          opacity={DEFAULT_OPACITY} />
    <path
      d='M216 48v48a8 8 0 0 1-16 0V67.31l-50.34 50.35a8 8 0 0 1-11.32-11.32L188.69 56H160a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m-109.66 90.34L56 188.69V160a8 8 0 0 0-16 0v48a8 8 0 0 0 8 8h48a8 8 0 0 0 0-16H67.31l50.35-50.34a8 8 0 0 0-11.32-11.32' />
  </BaseIcon>;
}

export interface ArrowInIconProps extends BaseIconProps {
}

export function ArrowInIcon(props: ArrowInIconProps) {
  return <BaseIcon {...props} >
    <path d="M224 48v160a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h160a16 16 0 0 1 16 16"
          opacity={DEFAULT_OPACITY} />
    <path
      d="M213.66 53.66L163.31 104H192a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8V64a8 8 0 0 1 16 0v28.69l50.34-50.35a8 8 0 0 1 11.32 11.32M112 136H64a8 8 0 0 0 0 16h28.69l-50.35 50.34a8 8 0 0 0 11.32 11.32L104 163.31V192a8 8 0 0 0 16 0v-48a8 8 0 0 0-8-8" />
  </BaseIcon>;
}
