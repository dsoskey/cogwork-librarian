import { NormedCard, OracleKeys } from '../types/normedCard'
import { Filter } from './base'
import { anyFaceContains, anyFaceRegexMatch, noReminderText, replaceNamePlaceholder } from '../types/card'

export const textMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) => {
      return anyFaceContains(
        card,
        field,
        replaceNamePlaceholder(value, card.name)
      )
    }

export const exactMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) => card[field].toString().toLowerCase() === value

export const noReminderTextMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) =>
      anyFaceContains(
        card,
        field,
        replaceNamePlaceholder(value, card.name),
        noReminderText
      )

export const regexMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) =>
      anyFaceRegexMatch(
        card,
        field,
        new RegExp(replaceNamePlaceholder(value, card.name))
      )

export const noReminderRegexMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
    (card: NormedCard) =>
      anyFaceRegexMatch(
        card,
        field,
        new RegExp(replaceNamePlaceholder(value, card.name)),
        noReminderText
      )