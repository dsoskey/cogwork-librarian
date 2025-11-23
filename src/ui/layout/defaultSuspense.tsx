import React, { Suspense } from "react";
import { LoaderText } from '../component/loaders'

export interface DefaultSuspenseProps {
  children: React.ReactNode;
}

export function DefaultSuspense({ children }: DefaultSuspenseProps) {

    return <Suspense fallback={<LoaderText />}>{children}</Suspense>;
}

