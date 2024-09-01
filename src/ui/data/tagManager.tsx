import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { LoaderText } from '../component/loaders'
import { DataTable } from './dataTable'
import { PageControl, usePageControl } from '../cardBrowser/pageControl'
import { TagLink } from '../cubeView/cubeTags'

export interface TagManagerProps {

}

const pageSize = 60
const ignoreKeys = new Set(["id", "object", 'type'])
export function TagManager({}: TagManagerProps) {
    const [tagType, setTagType] = useState<"oracleTag" | "illustrationTag">()
    const {
        lowerBound, upperBound,
        pageNumber, setPageNumber,
    } = usePageControl(pageSize);
    const count = useLiveQuery(() => cogDB.oracleTag.count());
    const pageData = useLiveQuery(() => {
      return cogDB.oracleTag
        .orderBy("label")
        .offset(lowerBound)
        .limit(pageSize)
        .toArray();
    }, [tagType, pageNumber, lowerBound])
    return <>
        <PageControl pageNumber={pageNumber} setPageNumber={setPageNumber}  pageSize={pageSize} count={count} upperBound={upperBound} />
      {!pageData && <LoaderText/>}
      {pageData && <DataTable
        data={pageData}
        ignoreKeys={ignoreKeys}
        keyKey="id"
        customRenders={{
            label: TagLink,
        }}
      />}
    </>;
}

