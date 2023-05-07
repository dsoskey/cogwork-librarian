import { NormedCard, OracleKeys } from '../../local/normedCard'
import { Filter } from '../filterBase'
import { anyFaceContains, replaceNamePlaceholder } from '../../card'

export const textMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) => {
      return anyFaceContains(
        card,
        field,
        replaceNamePlaceholder(value, card.name)
      )
    }