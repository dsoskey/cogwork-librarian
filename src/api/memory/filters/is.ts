import {
  anyFaceContains,
  DOUBLE_FACED_LAYOUTS,
  hasNumLandTypes,
  isDual,
  IsValue,
  noReminderText,
  SHOCKLAND_REGEX
} from '../../card'
import { NormedCard, Printing } from '../../local/normedCard'
import { FilterRes } from '../filterBase'
import { handlePrint } from './oracle'
import { textMatch } from './text'

export const isPrintPrefix = `is-print:`

const printMatterz = new Set([
  'fullart',
  'foil',
  'nonfoil',
  'firstprint',
  'firstprinting',
  'etch',
  'etched',
  'contentwarning',
  'promo',
  'reprint',
  'oversized',
  'textless',
  'digital',
  'mtgoid',
  'arenaid',
  'starterdeck',
  'buyabox',
  'prerelease',
  'gameday',
  'datestamped',
  'intropack',
  'release',
  'planeswalkerdeck',
  'extra',
])
function printMatters(value: IsValue): boolean {
  return printMatterz.has(value)
}

function unimplemented(value: string): boolean {
  console.warn(`is:${value} is unimplemented`)
  return false
}

const isPrintVal = (value: IsValue) => (print: Printing): boolean => {
  switch (value) {
    case 'fullart':
    case 'foil':
    case 'nonfoil':
    case 'firstprint':
    case 'firstprinting':
      return unimplemented(value) // Add when processing multiple prints
    case 'etch':
    case 'etched':
      return unimplemented(value)
    case 'contentwarning':
      return unimplemented(value)
    // return card.content_warning // todo: this should be on prints
    case 'promo':
    case 'reprint':
    case 'oversized':
    case 'textless':
    case 'digital':
      return print[value]
    case 'mtgoid':
      return print.mtgo_id !== null && print.mtgo_id !== undefined
    // return card.printings.find() !== undefined
    case 'arenaid':
      return print.arena_id !== null && print.arena_id !== undefined
    // return card.printings.find(it => it.arena_id !== null && it.arena_id !== undefined) !== undefined
    case 'starterdeck':
    case 'buyabox':
    case 'prerelease':
    case 'gameday':
    case 'datestamped':
    case 'intropack':
    case 'release':
    case 'planeswalkerdeck':
      return print.promo_types?.includes(value)
    // return card.printings.find(it => it.promo_types?.includes(value)) !== undefined
    case 'extra':
      return unimplemented(value)
    // return card.layout === 'art_series' ||
    //   card.layout === 'token' ||
    //   card.layout === 'double_faced_token' ||
    //   card.layout === 'emblem'
    // card.set_type !== 'memorabilia' handle with prints
    default:
      return unimplemented(value)
  }
}

const isOracleVal = (value: IsValue) => (card: NormedCard): boolean => {
  switch (value) {
    case 'duelcommander':
    case 'halo':
    case 'variation':
    case 'artseries':
    case 'doublesided':
    case 'hires':
    case 'localizedname':
    case 'watermark':
    case 'multiverse':
    case 'old':
    case 'fbb':
    case 'englishart':
    case 'artist':
    case 'stamp':
    case 'stamped':
    case 'booster':
    case 'extended':
    case 'frenchvanilla':
    case 'tcgplayer':
    case 'modern':
    case 'cardmarket':
    case 'lights':
    case 'flavorname':
    case 'funny':
    case 'tombstone':
    case 'ci':
    case 'artistmisprint':
    case 'future':
    case 'colorshifted':
    case 'showcase':
    case 'illustration':
    case 'story':
    case 'oathbreaker':
    case 'etb':
    case 'spellbook':
    case 'bear':
    case 'new': // new frame
    case 'spikey':
    case 'flavor':
    case 'fwb':
    case 'covered':
    case 'printedtext':
    case 'back':
    case 'brawlcommander':
    case 'class':
    case 'paperart':
    case 'masterpiece':
      return unimplemented(value)
    // not found on card json
    case 'invitational':
    case 'belzenlok':
      return unimplemented(value)
    case 'reserved':
      return card.reserved
    case 'planar':
      return textMatch('type_line', 'plane ')(card) || textMatch('type_line', 'phenomenon')(card)
    case 'augmentation':
      return card.layout === "augment" || card.layout === "host"
    case 'companion':
      return card.keywords.includes("Companion")
    case 'reversible':
      return card.layout.toLowerCase() === "reversible_card"
    case 'related':
      return card.all_parts !== undefined && card.all_parts.length > 0
    case 'onlyprint':
      return card.printings.length === 1
    case 'gold':
      return (card.colors?.length ?? 0) >= 2
    case 'splitmana': // has hybrid or twobrid mana
    case 'hybrid':
      return unimplemented(value)
    case 'phyrexia':
    case 'phyrexian':
      return unimplemented(value)
    case 'dfc':
      return DOUBLE_FACED_LAYOUTS.includes(card.layout)
    case 'mdfc':
      return card.layout === 'modal_dfc'
    case 'meld':
      return card.layout === 'meld'
    case 'tdfc':
    case 'transform':
      return card.layout === 'transform'
    case 'split':
      return card.layout === 'split'
    case 'flip':
      return card.layout === 'flip'
    case 'leveler':
      return card.layout === 'leveler'
    case 'adventure':
      return card.layout === 'adventure'

    // TODO: check any face for types
    case 'commander':
      return (
        card.type_line.toLowerCase().includes('legendary creature') ||
        anyFaceContains(
          card,
          'oracle_text',
          `${card.name} can be your commander.`
        )
      )
    case 'spell':
      return (
        ['land', 'token'].filter((type) =>
          card.type_line.toLowerCase().includes(type)
        ).length === 0
      )
    case 'party':
      return ['cleric', 'rogue', 'warrior', 'wizard'].filter((type) =>
        textMatch('type_line', type)(card)
        || textMatch("oracle_text", "changeling")
      ).length > 0
    case 'permanent':
      return (
        ['instant', 'sorcery'].filter((type) =>
          textMatch('type_line', type)(card)
        ).length === 0
      )
    case 'historic':
      return (
        ['legendary', 'artifact', 'saga'].filter((type) =>
          textMatch('type_line', type)(card)
        ).length > 0
      )
    case 'vanilla':
      return (
        card.oracle_text?.length === 0 ||
        card.card_faces.filter((i) => i.oracle_text.length === 0).length > 0
      )
    case 'modal':
      return /chooses? (\S* or \S*|(up to )?(one|two|three|four|five))( or (more|both)| that hasn't been chosen)?( —|\.)/.test(
        card.oracle_text?.toLowerCase()
      )
    case 'token':
      return card.layout === 'token' || card.type_line.includes('Token')
    case 'bikeland':
    case 'cycleland':
    case 'bicycleland':
      return (
        hasNumLandTypes(card, 2) && card.oracle_text?.includes('Cycling {2}')
      )
    case 'bounceland':
    case 'karoo':
      return (
        /Add \{.}\{.}\./.test(card.oracle_text) &&
        (/When .* enters the battlefield, sacrifice it unless you return an untapped/.test(
            card.oracle_text
          ) ||
          /When .* enters the battlefield, return a land you control to its owner's hand/.test(
            card.oracle_text
          ))
      )
    case 'canopyland':
    case 'canland':
      return /Pay 1 life: Add \{.} or \{.}\.\n\{1}, \{T}, Sacrifice/m.test(
        card.oracle_text
      )
    case 'fetchland':
      return /\{T}, Pay 1 life, Sacrifice .*: Search your library for an? .* or .* card, put it onto the battlefield, then shuffle/.test(
        card.oracle_text
      )
    case 'checkland':
      return (
        isDual(card) &&
        /.* enters the battlefield tapped unless you control an? .* or an? *./.test(
          card.oracle_text
        )
      )
    case 'dual':
      return (
        hasNumLandTypes(card, 2) &&
        noReminderText(card.oracle_text?.toLowerCase()).length === 0
      )
    case 'fastland':
      return (
        isDual(card) &&
        /.* enters the battlefield tapped unless you control two or fewer other lands\./.test(
          card.oracle_text
        )
      )
    case 'filterland':
      return (
        card.type_line.includes('Land') &&
        (/\{T}: Add \{C}\.\n{.\/.}, \{T}: Add \{.}{.}, \{.}\{.}, or \{.}\{.}\./m.test(
            card.oracle_text
          ) ||
          /\{1}, \{T}: Add \{.}\{.}\./.test(card.oracle_text))
      )
    case 'gainland':
      return (
        isDual(card) &&
        /.* enters the battlefield tapped\./.test(card.oracle_text) &&
        /When .* enters the battlefield, you gain 1 life\./.test(
          card.oracle_text
        )
      )
    case 'painland':
      return (
        card.type_line.includes('Land') &&
        /\{T}: Add {C}\./.test(card.oracle_text) &&
        /\{T}: Add {.} or {.}\. .* deals 1 damage to you\./.test(
          card.oracle_text
        )
      )
    case 'scryland':
      return (
        isDual(card) &&
        /When .* enters the battlefield, scry 1/.test(card.oracle_text)
      )
    case 'shadowland':
    case 'snarl':
      return (
        isDual(card) &&
        /As .* enters the battlefield, you may reveal an? .* or .* card from your hand\. If you don't, .* enters the battlefield tapped./.test(
          card.oracle_text
        )
      )
    case 'shockland':
      return (
        hasNumLandTypes(card, 2) && SHOCKLAND_REGEX.test(card.oracle_text)
      )
    case 'storageland':
      return (
        card.type_line.includes('Land') &&
        /storage counter/.test(card.oracle_text)
      )
    case 'manland':
    case 'creatureland':
      return (
        card.type_line.includes('Land') &&
        new RegExp(`(${card.name}|it) becomes? an? .* creature`).test(
          card.oracle_text
        )
      )
    case 'triland':
      return (
        card.type_line.includes('Land') &&
        hasNumLandTypes(card, 0) &&
        /\{T}: Add {.}, \{.}, or {.}\./.test(card.oracle_text)
      )
    case 'trikeland':
    case 'tricycleland':
    case 'triome':
      return (
        card.type_line.includes('Land') &&
        hasNumLandTypes(card, 3) &&
        /\{T}: Add {.}, \{.}, or {.}\./.test(card.oracle_text)
      )
    case 'tangoland':
    case 'battleland':
      return (
        card.type_line.includes('Land') &&
        hasNumLandTypes(card, 2) &&
        /.* enters the battlefield tapped unless you control two or more basic lands\./.test(
          card.oracle_text
        )
      )
    case 'slowland':
      return (
        isDual(card) &&
        /.* enters the battlefield tapped unless you control two or more other lands\./.test(
          card.oracle_text
        )
      )
    default:
      return unimplemented(value)
  }
}

export const isVal = (value: IsValue): FilterRes<NormedCard> => {
  const _printMatters = printMatters(value)

  if (_printMatters) {
    return handlePrint([`${isPrintPrefix}${value}`], isPrintVal(value))
  }

  return {
    filtersUsed: ['is'],
    filterFunc: isOracleVal(value),
  }
}
