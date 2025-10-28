import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from './db'

export function useCardLoader(name, set, cn) {
  return useLiveQuery(
    async () => cogDB.getCardByName(name, set, cn),
    [name, set, cn],
    null)
}