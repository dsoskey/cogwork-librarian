import { useState } from 'react'
import { TaskStatus } from '../../types'
import { QueryReport, useReporter } from '../useReporter'
import { TagType } from 'mtgql'
import DBWorker from './dbWorker?worker';

export interface OracleTagImporter {
  oracleTagReport: QueryReport
  taskStatus: TaskStatus
  loadTags: (type: TagType) => Promise<void>
}

export const LOADING_MESSAGES = [
  "downloading tags",
  "saving tags to db",
]
export const useTagImporter = (): OracleTagImporter => {
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('unstarted')
  const oracleTagReport = useReporter()

  const onOracleTagWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    switch (type) {
      case "oracle-tags-downloaded":
      case "illustration-tags-downloaded":
        oracleTagReport.addComplete()
        break;
      case "oracle-tag-end":
      case "illustration-tag-end":
        console.timeEnd(type === "otag" ? "loaded oracle tags" : "loaded illustration tags")
        oracleTagReport.addComplete()
        oracleTagReport.markTimepoint('end')
        setTaskStatus('success')
        break;
      case 'error':
        console.error('waaaaaa', data)
        setTaskStatus('error')
        break
      default:
        console.error(`unknown message [${type}] from db worker`)
        break
    }
  }

  const loadTags = async (type: TagType) => {
    console.time(`loaded ${type} tags`)
    // @ts-ignore
    const worker = new DBWorker()
    setTaskStatus("loading")
    oracleTagReport.reset(2)

    worker.onmessage = onOracleTagWorkerMessage

    worker.postMessage({ type: `load-${type}-tags` })
  }

  return {
    oracleTagReport,
    taskStatus,
    loadTags,
  }
}