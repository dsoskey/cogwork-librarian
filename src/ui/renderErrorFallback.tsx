import React from "react";
import { FallbackProps } from 'react-error-boundary'
import { DefaultLayout } from './layout/defaultLayout'

// TODO: Add bug report link
export function RenderErrorFallback({ error }: FallbackProps) {

    return <DefaultLayout>
      <h2>Something went wrong while rendering the UI</h2>
      <pre><code>{error.toString()}</code></pre>
    </DefaultLayout>;
}

