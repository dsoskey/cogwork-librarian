import { NormedCard, OracleKeys, PrintingFilterTuple } from '../types/normedCard'
import { defaultCompare, Filter, Operator } from './base'
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

export const oracleTextCount = (operator: Operator, count: number, transform = (it) => it) =>
  (card: NormedCard) => {
    const getCount = (it) => {
      const transed = transform(it??"")
      return transed.length ? transed.split(/\s+/).length : 0
    }
    let wordCount;
    if (card.oracle_text !== undefined) {
      wordCount = getCount(card.oracle_text)
    } else {
      wordCount = card.card_faces.map(it => getCount(it.oracle_text)).reduce((l,r) => l+r)
    }
    return defaultCompare(wordCount, operator, count)
  }

export const flavorTextCount = (operator: Operator, count: number) =>
  (tuple: PrintingFilterTuple) => {
    const {printing} = tuple;
    const getCount = (it) => {
      return (it ?? "").length ? it.split(/\s+/).length : 0
    }
    let wordCount;
    if (printing.flavor_text !== undefined) {
      wordCount = getCount(printing.flavor_text)
    } else {
      wordCount = printing.card_faces.map(it => getCount(it.flavor_text)).reduce((l,r) => l+r)
    }
    return defaultCompare(wordCount, operator, count)
  }

/* Raw paste from Scryfall discord
\spt
(?:[\dX]+\/[\dX]+)

\spp
(?:\+[\dX]+\/\+[\dX]+)

\smm
(?:\-[\dX]+\/\-[\dX]+)

\smr
(?:\{X\}\{X\}|\{0\}\{0\}|\{1\}\{1\}|\{2\}\{2\}|\{3\}\{3\}|\{4\}\{4\}|\{5\}\{5\}|\{6\}\{6\}|\{7\}\{7\}|\{8\}\{8\}|\{9\}\{9\}|\{10\}\{10\}|\{11\}\{11\}|\{12\}\{12\}|\{13\}\{13\}|\{14\}\{14\}|\{15\}\{15\}|\{16\}\{16\}|\{17\}\{17\}|\{18\}\{18\}|\{19\}\{19\}|\{20\}\{20\}|\{W/U\}\{W/U\}|\{W/B\}\{W/B\}|\{B/R\}\{B/R\}|\{B/G\}\{B/G\}|\{U/B\}\{U/B\}|\{U/R\}\{U/R\}|\{R/G\}\{R/G\}|\{R/W\}\{R/W\}|\{G/W\}\{G/W\}|\{G/U\}\{G/U\}|\{B/G/P\}\{B/G/P\}|\{B/R/P\}\{B/R/P\}|\{G/U/P\}\{G/U/P\}|\{G/W/P\}\{G/W/P\}|\{R/G/P\}\{R/G/P\}|\{R/W/P\}\{R/W/P\}|\{U/B/P\}\{U/B/P\}|\{U/R/P\}\{U/R/P\}|\{W/B/P\}\{W/B/P\}|\{W/U/P\}\{W/U/P\}|\{2/W\}\{2/W\}|\{2/U\}\{2/U\}|\{2/B\}\{2/B\}|\{2/R\}\{2/R\}|\{2/G\}\{2/G\}|\{P\}\{P\}|\{W/P\}\{W/P\}|\{U/P\}\{U/P\}|\{B/P\}\{B/P\}|\{R/P\}\{R/P\}|\{G/P\}\{G/P\}|\{W\}\{W\}|\{U\}\{U\}|\{B\}\{B\}|\{R\}\{R\}|\{G\}\{G\}|\{C\}\{C\}|\{S\}\{S\})

\sm
(?:\{[/0123456789BCGHPRSUWXYZ½∞]+\})

\sc
(?:\{(?:2/[WUBRG]|[WUBRG]/*[WUBRGP]*)+\})

\ss
(?:\{[/0123456789ABCEGHKOPQRSTUWXYZ½∞]+\})
 */
export const substituteScryfallRegex = (value: string): string => {
  return value
    .replace(/\\spt/g, "(?:[\\dX]+\\/[\\dX]+)")
    .replace(/\\spp/g, "(?:\\+[\\dX]+\\/\\+[\\dX]+)")
    .replace(/\\smm/g, "(?:\\-[\\dX]+\\/\\-[\\dX]+)")
    .replace(/\\smr/g, "(?:\\{X\\}\\{X\\}|\\{0\\}\\{0\\}|\\{1\\}\\{1\\}|\\{2\\}\\{2\\}|\\{3\\}\\{3\\}|\\{4\\}\\{4\\}|\\{5\\}\\{5\\}|\\{6\\}\\{6\\}|\\{7\\}\\{7\\}|\\{8\\}\\{8\\}|\\{9\\}\\{9\\}|\\{10\\}\\{10\\}|\\{11\\}\\{11\\}|\\{12\\}\\{12\\}|\\{13\\}\\{13\\}|\\{14\\}\\{14\\}|\\{15\\}\\{15\\}|\\{16\\}\\{16\\}|\\{17\\}\\{17\\}|\\{18\\}\\{18\\}|\\{19\\}\\{19\\}|\\{20\\}\\{20\\}|\\{W/U\\}\\{W/U\\}|\\{W/B\\}\\{W/B\\}|\\{B/R\\}\\{B/R\\}|\\{B/G\\}\\{B/G\\}|\\{U/B\\}\\{U/B\\}|\\{U/R\\}\\{U/R\\}|\\{R/G\\}\\{R/G\\}|\\{R/W\\}\\{R/W\\}|\\{G/W\\}\\{G/W\\}|\\{G/U\\}\\{G/U\\}|\\{B/G/P\\}\\{B/G/P\\}|\\{B/R/P\\}\\{B/R/P\\}|\\{G/U/P\\}\\{G/U/P\\}|\\{G/W/P\\}\\{G/W/P\\}|\\{R/G/P\\}\\{R/G/P\\}|\\{R/W/P\\}\\{R/W/P\\}|\\{U/B/P\\}\\{U/B/P\\}|\\{U/R/P\\}\\{U/R/P\\}|\\{W/B/P\\}\\{W/B/P\\}|\\{W/U/P\\}\\{W/U/P\\}|\\{2/W\\}\\{2/W\\}|\\{2/U\\}\\{2/U\\}|\\{2/B\\}\\{2/B\\}|\\{2/R\\}\\{2/R\\}|\\{2/G\\}\\{2/G\\}|\\{P\\}\\{P\\}|\\{W/P\\}\\{W/P\\}|\\{U/P\\}\\{U/P\\}|\\{B/P\\}\\{B/P\\}|\\{R/P\\}\\{R/P\\}|\\{G/P\\}\\{G/P\\}|\\{W\\}\\{W\\}|\\{U\\}\\{U\\}|\\{B\\}\\{B\\}|\\{R\\}\\{R\\}|\\{G\\}\\{G\\}|\\{C\\}\\{C\\}|\\{S\\}\\{S\\})")
    .replace(/\\smh/g, "(?:\\{[2BCGRUW]/[BCGRUW]\\})")
    .replace(/\\smp/g, "(?:\\{([WUBRG]\\/([WUBRG]\\/)?)?P})")
    .replace(/\\sm/g, "(?:\\{[/0123456789BCGHPRSUWXYZ½∞]+\\})")
    .replace(/\\sc/g, "(?:\\{(?:2/[WUBRG]|[WUBRG]/*[WUBRGP]*)+\\})")
    .replace(/\\ss/g, "(?:\\{[/0123456789ABCEGHKOPQRSTUWXYZ½∞]+\\})")
}

export const regexMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> => {
      const baseRegex = substituteScryfallRegex(value)
      return (card: NormedCard) =>
        anyFaceRegexMatch(
          card,
          field,
          new RegExp(replaceNamePlaceholder(baseRegex, card.name))
        )
  }


export const noReminderRegexMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> => {
      const baseRegex = substituteScryfallRegex(value)
      return (card: NormedCard) =>
        anyFaceRegexMatch(
          card,
          field,
          new RegExp(replaceNamePlaceholder(baseRegex, card.name)),
          noReminderText
        )
  }
