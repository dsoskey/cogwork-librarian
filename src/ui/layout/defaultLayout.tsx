import React from "react";
import { Masthead } from '../component/masthead'
import { Footer } from '../footer'
import "./defaultLayout.css"

export interface DefaultLayoutProps extends React.PropsWithChildren<{}> {

}

export function DefaultLayout({ children }: DefaultLayoutProps) {

    return <>
        <Masthead />
        <div className="default-layout">
            {children}
        </div>
        <Footer />
    </>;
}

