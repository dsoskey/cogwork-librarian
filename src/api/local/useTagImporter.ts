import { useState } from 'react'
import { TaskStatus } from '../../types'
import { QueryReport, useReporter } from '../useReporter'

export interface OracleTagImporter {
  oracleTagReport: QueryReport
  taskStatus: TaskStatus
  cardModifyStatus: TaskStatus
  loadOracleTags: () => Promise<void>
}

export const LOADING_MESSAGES = [
  "downloading oracle tags...",
  "saving oracle tags to db...",
  "propagating tags to cards...",
]
export const useTagImporter = (): OracleTagImporter => {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('unstarted')
  const [cardModifyStatus, setCardModifyStatus] = useState<TaskStatus>('unstarted')
  const oracleTagReport = useReporter()

  const onOracleTagWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    switch (type) {
      case "oracle-tags-downloaded":
        oracleTagReport.addComplete()
        break;
      case "oracle-tags-put":
        oracleTagReport.addComplete()
        oracleTagReport.setTotalCards(data)
        setCardModifyStatus("loading")
        break;
      case "oracle-tags-card-saved":
        if (data % 1000 === 0) {
          oracleTagReport.addCardCount(1000)
        }
        break;
      case "end":
        console.timeEnd("loaded oracle tags")
        oracleTagReport.addComplete()
        oracleTagReport.markTimepoint('end')
        setTaskStatus('success')
        setCardModifyStatus("success")
        break;
      case 'error':
        console.error('waaaaaa', data)
        setTaskStatus('error')
        setCardModifyStatus(prev => prev === 'loading' ? 'error' : prev)
        break
      default:
        console.error('unknown message from db worker')
        break
    }
  }

  const loadOracleTags = async () => {
    console.time("loaded oracle tags")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    setTaskStatus("loading")
    oracleTagReport.reset(3)

    worker.onmessage = onOracleTagWorkerMessage

    worker.postMessage({ type: "load-oracle-tags" })
  }

  return {
    oracleTagReport,
    taskStatus,
    cardModifyStatus,
    loadOracleTags,
  }
}