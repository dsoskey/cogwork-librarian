import React from 'react'
import { LOADING_MESSAGES, useTagImporter } from '../../api/local/useTagImporter'
import { LoaderBar, LoaderText } from '../component/loaders'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'

export const TagImporter = () => {
  const oTagCount = useLiveQuery(async () => cogDB.oracleTag.count())
  const aTagCount = useLiveQuery(async () => cogDB.illustrationTag.count())
  const oracleTagImporter = useTagImporter()
  const missingTags = []
  if (oTagCount === 0) { missingTags.push("oracle") }
  if (aTagCount === 0) { missingTags.push("illustration") }

  return <section className='column'>
    <h4>you want some tags?</h4>
    {missingTags.length > 0
      ? <span>it looks like your database lacks tags! bet you want some, huh?</span>
      : <span>your database already has tags, but maybe you want to get the latest tags from scryfall?</span>
    }
    <span>
      <button
        onClick={() => oracleTagImporter.loadTags("oracle")}
        disabled={oracleTagImporter.taskStatus === 'loading'}
      >
        {oTagCount === 0 ? "give me oracle tags!" : "update my oracle tags!"}
      </button>
      <button
        onClick={() => oracleTagImporter.loadTags("illustration")}
        disabled={oracleTagImporter.taskStatus === 'loading'}
      >
        {aTagCount === 0 ? "give me illustration tags!" : "update my illustration tags!"}
      </button>
    </span>
    {oracleTagImporter.taskStatus === 'loading' && <>
      <div><LoaderText text={LOADING_MESSAGES[oracleTagImporter.oracleTagReport.complete]} /></div>
      <LoaderBar width={500} count={oracleTagImporter.oracleTagReport.complete} total={oracleTagImporter.oracleTagReport.totalQueries} />
    </>}
  </section>
}