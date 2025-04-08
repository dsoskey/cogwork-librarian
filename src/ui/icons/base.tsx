export const DEFAULT_FILL = 'var(--text-color)'
export const DEFAULT_SIZE = '18';
export const DEFAULT_OPACITY = "0.5";

import React from "react";

interface _BaseIconProps extends React.SVGProps<SVGSVGElement> {
  children: React.ReactNode;
}

export interface BaseIconProps extends Omit<_BaseIconProps, "children"> {
}

export function BaseIcon({ fill, children }: _BaseIconProps) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={DEFAULT_SIZE} height={DEFAULT_SIZE} viewBox="0 0 256 256">
    <g fill={fill ?? DEFAULT_FILL}>
      {children}
    </g>
  </svg>;
}
