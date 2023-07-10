import React from 'react'
import { LOADING_MESSAGES, useTagImporter } from '../../api/local/useTagImporter'
import { Loader } from '../component/loader'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'

export const OracleTagImporter = () => {
  const oTagCount = useLiveQuery(async () => cogDB.oracleTag.count())
  const oracleTagImporter = useTagImporter()

  return <section className='column'>
    <h4>you want some oracle tags?</h4>
    {oTagCount === 0
      ? <span>it looks like your database lacks oracle tags! bet you want some, huh?</span>
      : <span>your database already has oracle tags, but maybe you want to get the latest tags from scryfall?</span>
    }
    <span>
      <button
        onClick={oracleTagImporter.loadOracleTags}
        disabled={oracleTagImporter.taskStatus === 'loading'}
      >
        give me the tags!
      </button>
    </span>
    {oracleTagImporter.taskStatus === 'loading' && <>
      <div>{LOADING_MESSAGES[oracleTagImporter.oracleTagReport.complete]}</div>
      <Loader width={500} count={oracleTagImporter.oracleTagReport.complete} total={oracleTagImporter.oracleTagReport.totalQueries} />
      {oracleTagImporter.cardModifyStatus === 'loading' && <Loader width={500} label='card' count={oracleTagImporter.oracleTagReport.cardCount} total={oracleTagImporter.oracleTagReport.totalCards} />}
    </>}
  </section>
}