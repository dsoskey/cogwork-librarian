import { NormedCard, OracleKeys } from '../types/normedCard'
import { Filter } from './base'
import { anyFaceContains, replaceNamePlaceholder } from '../types/card'

export const textMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) => {
      return anyFaceContains(
        card,
        field,
        replaceNamePlaceholder(value, card.name)
      )
    }