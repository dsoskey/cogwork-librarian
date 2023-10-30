import { useContext, useRef, useState } from 'react'
import { TaskStatus } from '../../types'
import { QueryReport, useReporter } from '../useReporter'
import { CogDBContext } from './useCogDB'

export interface OracleTagImporter {
  oracleTagReport: QueryReport
  taskStatus: TaskStatus
  loadTags: (type: "oracle" | "illustration") => Promise<void>
}

export const LOADING_MESSAGES = [
  "downloading tags...",
  "saving tags to db...",
]
export const useTagImporter = (): OracleTagImporter => {
  const { setOtags, setAtags } = useContext(CogDBContext)
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('unstarted')
  const oracleTagReport = useReporter()
  const rezzy = useRef<{ [key: string]: Set<string> }>({})

  const onOracleTagWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    switch (type) {
      case "oracle-tags-downloaded":
      case "illustration-tags-downloaded":
        oracleTagReport.addComplete()
        break;
      case "oracle-tag":
      case "illustration-tag":
        rezzy.current[data.key] = new Set(data.values)
        break;
      case "oracle-tag-end":
      case "illustration-tag-end":
        console.timeEnd(type === "otag" ? "loaded oracle tags" : "loaded illustration tags")
        oracleTagReport.addComplete()
        oracleTagReport.markTimepoint('end')
        const setter = type === "otag" ? setOtags : setAtags
        setter(rezzy.current)
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

  const loadTags = async (type: "oracle" | "illustration") => {
    console.time(`loaded ${type} tags`)
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    setTaskStatus("loading")
    oracleTagReport.reset(2)
    rezzy.current = {}

    worker.onmessage = onOracleTagWorkerMessage

    worker.postMessage({ type: `load-${type}-tags` })
  }

  return {
    oracleTagReport,
    taskStatus,
    loadTags,
  }
}