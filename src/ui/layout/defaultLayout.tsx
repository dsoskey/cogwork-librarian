import React from 'react'
import { Masthead } from '../component/masthead'
import { Footer } from '../footer'
import "./defaultLayout.css"
import { DefaultSuspense } from './defaultSuspense'

export interface DefaultLayoutProps extends React.PropsWithChildren<{}> {
    showFooter?: boolean;
}

export function DefaultLayout({ children, showFooter = true }: DefaultLayoutProps) {

    return <>
        <Masthead />
        <div className="default-layout">
            <DefaultSuspense>{children}</DefaultSuspense>
        </div>
        {showFooter && <Footer />}
    </>;
}

