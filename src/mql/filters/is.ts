import {
  anyFaceContains, anyFaceRegexMatch,
  DOUBLE_FACED_LAYOUTS,
  hasNumLandTypes,
  isDual,
  IsValue,
  noReminderText,
  SHOCKLAND_REGEX
} from '../types/card'
import { DEFAULT_CARD_BACK_ID, NormedCard, PrintingFilterTuple } from '../types/normedCard'
import { FilterNode } from './base'
import { oracleNode } from './oracle'
import { textMatch } from './text'
import { parsePowTou } from '../types/card'
import { printNode } from './print'

export const isPrintPrefix = `is-print:`

const printMattersFields = new Set<IsValue>([
  'old',
  'modern',
  'new',
  'future',
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
  'multiverse',
  'illustration',
  'story',
  'hires',
  'starterdeck',
  'buyabox',
  'prerelease',
  'gameday',
  'datestamped',
  'intropack',
  'release',
  'planeswalkerdeck',
  'extra',
  'watermark',
  'extended',
  'colorshifted',
  'showcase',
  'tombstone',
  'flavor',
  'funny',
  'masterpiece',
  'core',
  'variation',
  'booster',
  'stamp',
  'stamped',
  'artist',
  'lights',
  'back',
  'cardmarket',
  'tcgplayer',
  'fbb',
  'fwb',
  'localizedname',
  'flavorname',
  'halo',
  'ub',
  'universesbeyond',
  'serialized',
  'setextension',
  'placeholderimage',
  'scroll',
  'poster',
  'boosterfun',
  'brawldeck',
  'rebalanced',
  'duels',
  'embossed',
  'moonlitland',
  'openhouse',
  'boxtopper',
  'promopack',
  'gilded',
  'playpromo',
  'setpromo',
  'fnm',
  'mediainsert',
  'wizardsplaynetwork',
  'bundle',
  'concept',
  'halofoil',
  'godzillaseries',
  'neonink',
  'instore',
  'arenaleague',
  'starterdeck',
  'confettifoil',
  'textured',
  'convention',
  'themepack',
  'commanderparty',
  'bringafriend',
  'plastic',
  'alchemy',
  'gameday',
  'intropack',
  'draculaseries',
  'silverfoil',
  'datestamped',
  'league',
  'doublerainbow',
  'release',
  'draftweekend',
  'event',
  'surgefoil',
  'schinesealtart',
  'playerrewards',
  'storechampionship',
  'giftbox',
  'galaxyfoil',
  'glossy',
  'stepandcompleat',
  'oilslick',
  'tourney',
  'premiereshop',
  'judgegift',
  'thick',
  'jpwalker',
  'prerelease',
  'planeswalkerdeck',
])
export function printMatters(value: IsValue): boolean {
  return printMattersFields.has(value)
}

function unimplemented(value: string): boolean {
  console.warn(`is:${value} is unimplemented`)
  return false
}

export const isPrintVal = (value: IsValue) => ({ printing, card }: PrintingFilterTuple): boolean => {
  switch (value) {
    case 'illustration':
      return printing.illustration_id !== undefined
    case 'multiverse':
      return printing.multiverse_ids?.length > 0
    case 'cardmarket':
      return printing.cardmarket_id !== undefined
    case 'tcgplayer':
      return printing.tcgplayer_id !== undefined
    case 'fbb':
      return printing.lang !== 'en' && printing.border_color === 'black'
    case 'fwb':
      return printing.lang !== 'en' && printing.border_color === 'white'
    case 'localizedname':
      return printing.printed_name !== undefined
    case 'flavorname':
      return printing.flavor_name !== undefined
    case 'foil':
      return printing.finishes.includes('foil')
    case 'nonfoil':
      return printing.finishes.includes('nonfoil')
    case 'etch':
    case 'etched':
      return printing.finishes.includes('etched')
    case 'contentwarning':
    return card.content_warning
    case 'booster':
    case 'variation':
    case 'promo':
    case 'reprint':
    case 'oversized':
    case 'textless':
    case 'digital':
      return printing[value]
    case 'hires':
      return printing.highres_image
    case 'mtgoid':
      return printing.mtgo_id !== null && printing.mtgo_id !== undefined
    case 'arenaid':
      return printing.arena_id !== null && printing.arena_id !== undefined
    case 'fullart':
      return printing.full_art
    case 'story':
      return printing.story_spotlight
    case 'watermark':
      return printing.watermark !== undefined
    case 'stamp':
    case 'stamped':
      return printing.security_stamp?.length > 0
    case 'ub':
    case 'universesbeyond':
      return printing.security_stamp?.includes('triangle')
    case 'artist':
      return printing.artist?.length > 0
    case 'flavor':
      return printing.flavor_text !== undefined
        || printing.card_faces.find(it => it.flavor_text !== undefined) !== undefined
    case 'firstprint':
    case 'firstprinting':
      return !printing.reprint
    case 'tombstone':
    case 'showcase':
      return printing.frame_effects?.includes(value)
    case 'extended':
      return printing.frame_effects?.includes('extendedart')
    case 'colorshifted':
      return printing.frame_effects?.includes('colorshifted')
    case 'lights':
      // @ts-ignore scryfall-sdk needs to update it
      return printing.attraction_lights?.length > 0
    case 'back':
      return printing.card_back_id !== DEFAULT_CARD_BACK_ID
    case 'scroll':
    case 'poster':
    case 'boosterfun':
    case 'brawldeck':
    case 'rebalanced':
    case 'duels':
    case 'embossed':
    case 'moonlitland':
    case 'openhouse':
    case 'boxtopper':
    case 'promopack':
    case 'gilded':
    case 'playpromo':
    case 'setpromo':
    case 'fnm':
    case 'mediainsert':
    case 'wizardsplaynetwork':
    case 'bundle':
    case 'concept':
    case 'halofoil':
    case 'godzillaseries':
    case 'neonink':
    case 'instore':
    case 'arenaleague':
    case 'starterdeck':
    case 'confettifoil':
    case 'textured':
    case 'convention':
    case 'themepack':
    case 'commanderparty':
    case 'bringafriend':
    case 'plastic':
    case 'alchemy':
    case 'gameday':
    case 'intropack':
    case 'draculaseries':
    case 'silverfoil':
    case 'datestamped':
    case 'league':
    case 'doublerainbow':
    case 'release':
    case 'draftweekend':
    case 'event':
    case 'surgefoil':
    case 'schinesealtart':
    case 'playerrewards':
    case 'storechampionship':
    case 'giftbox':
    case 'galaxyfoil':
    case 'glossy':
    case 'stepandcompleat':
    case 'oilslick':
    case 'tourney':
    case 'premiereshop':
    case 'judgegift':
    case 'thick':
    case 'jpwalker':
    case 'prerelease':
    case 'planeswalkerdeck':
      // @ts-ignore
      return printing.promo_types?.includes(value)
    case 'halo':
      // @ts-ignore
      return printing.promo_types?.includes('halofoil')
    // frames
    case 'old':
      return ['1993', '1997'].includes(printing.frame)
    case 'modern':
      return printing.frame === '2003'
    case 'new':
      return ['2003', '2015'].includes(printing.frame)
    case 'future':
      return printing.frame.toLowerCase() === 'future'
    case 'masterpiece':
    case 'expansion':
    case 'core':
    case 'funny':
      return printing.set_type === value
    case 'extra':
      // this doesn't work: this filters out cards that matched the oracle filter
      return isOracleVal('extra')(card) ||
        printing.set_type === 'memorabilia' ||
        printing.border_color === 'gold' ||
        (printing.border_color === 'silver' && printing.set_type === "promo") ||
        printing.oversized ||
        printing.set === "uplist" ||
        printing.set === "hho" ||
        printing.set === "ptg" ||
        printing.set === "h17" ||
        printing.set_type === 'token' ||
        // @ts-ignore
        printing.promo_types?.includes("thick") ||
        // @ts-ignore
        printing.games.includes("astral") ||
        // @ts-ignore
        printing.games.includes("sega") ||
        printing.set_name.includes("Heroes of the Realm") ||
        printing.set_name.includes("Playtest Cards")
    case 'placeholderimage':
      return printing.image_status === 'placeholder'
    // return card.layout === 'art_series' ||
    //   card.layout === 'token' ||
    //   card.layout === 'double_faced_token' ||
    //   card.layout === 'emblem'
    //  handle with prints
    default:
      return unimplemented(value)
  }
}

export const isOracleVal = (value: IsValue) => (card: NormedCard): boolean => {
  switch (value) {
    case 'unique': {
      const set = new Set(card.printings.map(it => it.set))
      return set.size === 1
    }
    case 'spellbook': // check oracle text for draft from spellbook text
      return anyFaceRegexMatch(card, 'oracle_text', /(conjure the power nine|(conjure|draft).* from .* spellbook)/)
    case 'etb':
      return textMatch('oracle_text', 'enters the battlefield')(card)
    case 'bear':
      return card.cmc === 2 && [
        card,
        ...card.card_faces
      ].find(it => parsePowTou(it.power) === 2 && parsePowTou(it.toughness) === 2) !== undefined
    case 'printedtext':
      return card.printed_text !== undefined
    case 'doublesided':
      return card.card_faces.length === 2
    case 'artseries':
      return card.layout === 'art_series'
    case 'ci':
      return card.color_indicator !== undefined || card.card_faces.find(it => it.color_indicator !== undefined) !== undefined
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
      return anyFaceRegexMatch(card, 'mana_cost', /\{.\/[^p](.\/p)?}/)
    case 'phyrexia':
    case 'phyrexian':
      return anyFaceRegexMatch(card, 'oracle_text', /\{.\/(.\/)?p}/)
        || anyFaceRegexMatch(card, 'mana_cost', /\{.\/(.\/)?p}/)
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
    case 'class':
      return card.type_line.toLowerCase().includes('class')
    case 'commander':
      return (
        card.type_line.split('//')[0].toLowerCase().includes('legendary creature') ||
        anyFaceContains(
          card,
          'oracle_text',
          `${card.name} can be your commander.`
        )
      )
    case 'oathbreaker':
      if (card.type_line === null || card.type_line === undefined) {
        console.warn(`Found card with no type: ${card.name}`)
        console.warn(card)
      }
      // @ts-ignore upgrade scryfall-sdk
      return card.type_line.split('//')[0].includes('Planeswalker') && card.legalities.oathbreaker === 'legal'
    case 'duelcommander':
      return !isOracleVal('token')(card) && isOracleVal('commander')(card) && card.legalities.duel === 'legal'
    case 'brawlcommander': // double check this ish
      return !isOracleVal('token')(card) && isOracleVal('commander')(card) && card.legalities.brawl !== 'banned'
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
        /\{T}: Add \{C}\./.test(card.oracle_text) &&
        /\{T}: Add \{.} or \{.}\. .* deals 1 damage to you\./.test(
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
        /\{T}: Add \{.}, \{.}, or \{.}\./.test(card.oracle_text)
      )
    case 'trikeland':
    case 'tricycleland':
    case 'triome':
      return (
        card.type_line.includes('Land') &&
        hasNumLandTypes(card, 3) &&
        /\{T}: Add \{.}, \{.}, or \{.}\./.test(card.oracle_text)
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
    case 'bondland':
      return (
        card.type_line.includes("Land") &&
        card.oracle_text?.includes("enters the battlefield tapped unless you have two or more opponents")
      )
    case 'slowland':
      return (
        isDual(card) &&
        /.* enters the battlefield tapped unless you control two or more other lands\./.test(
          card.oracle_text
        )
      )
    case 'extra':
       /*
       these aren't accounted for
       specialized
       cards only found from alchemy spellbooks
       */
      return card.layout === 'art_series' ||
        card.layout === 'token' ||
        card.layout === 'double_faced_token' ||
        card.layout === 'emblem' ||
        card.layout === 'planar' ||
        card.type_line?.includes("Vanguard") ||
        card.type_line?.includes("Scheme")
    // not found on/derived from card json
    case 'frenchvanilla': // this is gonna be a big parse :(((((((((((((((((((((
    case 'spikey':
    case 'paperart':
    case 'englishart':
    case 'artistmisprint':
    case 'covered':
    case 'invitational':
    case 'belzenlok':
    default:
      return unimplemented(value)
  }
}

export const isVal = (value: IsValue): FilterNode => {
  const _printMatters = printMatters(value)

  if (_printMatters) {
    return printNode([`${isPrintPrefix}${value}`], isPrintVal(value))
  }

  return oracleNode({
    filtersUsed: ['is'],
    filterFunc: isOracleVal(value),
  })
}
