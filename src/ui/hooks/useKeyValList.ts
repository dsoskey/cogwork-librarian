import { Setter } from '../../types'
import { useState } from 'react'

export type KVList<T> = [T[], { [key: string]: T[] }, Setter<T[]>]
export function useKeyValList<T>(transform: (s: T[]) => { [key: string]: T[] }): KVList<T> {
  const [mapData, setMapData] = useState<{ [key: string]: T[] }>({})
  const [listData, setListData] = useState<T[]>([])

  const setData = (list: T[]) => {
    const mapped = transform(list)
    setListData(list)
    setMapData(mapped)
  }
  return [listData, mapData, setData]
}