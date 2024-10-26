import { OrderedCard } from '../useCubeViewModel'

interface PresetDefinition {
  name: string
  description?: string
  preset: ((cards: OrderedCard[]) => string[]) | string[]
}

export const DEFAULT_QUERIES = [
  'produces>=2 or is:fetchland',
  'otag:card-advantage',
  'otag:life-payment',
  'otag:recursion',
  'otag:removal',
  'otag:creature-removal',
  'otag:draw',
  'otag:tutor',
  'otag:reanimate',
  'otag:ramp',
  'otag:evasion',
  'otag:discard-outlet',
  'otag:sacrifice-outlet',
  'otag:burn',
  'otag:tutor-battlefield',
  'otag:repeatable-token-generator',
  'otag:lifegain',
  'otag:mill',
  'otag:utility-land',
  'otag:planeswalker-removal',
  'otag:creature-type-erratum',
  'otag:boardwipe',
  'otag:counterspell',
  'otag:mana-sink',
  'otag:cantrip',
  'otag:discard',
  'otag:manland'
]

export const TABLE_PRESETS: PresetDefinition[] = [
  {
    name: "Default queries",
    description: "Reset to the original, hand-picked table",
    preset: DEFAULT_QUERIES
  },
  {
    name: "Card types",
    description: "All card types used in constructed magic and conspiracy",
    preset: [
      "t:creature",
      "t:artifact",
      "t:land",
      "t:instant",
      "t:sorcery",
      "t:enchantment",
      "t:planeswalker",
      "t:legendary",
      "t:battle",
      "t:kindred",
      "t:conspiracy",
    ]
  },
  {
    name: "Keywords",
    description: "All keywords included in this cube.",
    preset: keywordQueries,
  },
  {
    name: "Card Frames",
    description: "All card frames included in this cube.",
    preset: frameQueries
  },
  {
    name: "Subtypes",
    description: "All subtypes included in this cube.",
    preset: subtypeQueries
  }
]



export function keywordQueries(cards: OrderedCard[]): string[] {
  const kwSet = new Set<string>()
  for (const card of cards) {
    for (const kw of card.keywords) {
      kwSet.add(kw)
    }
  }
  const sorted = Array.from(kwSet).sort()
  return sorted.map(it => `kw:${it.includes(' ') ? '"' : ''}${it.toLocaleLowerCase()}${it.includes(' ') ? '"' : ''}`)
}

export function frameQueries(cards: OrderedCard[]): string[] {
  const kwSet = new Set<string>()
  for (const card of cards) {
      kwSet.add(card.frame)
  }
  const sorted = Array.from(kwSet).sort()
  return sorted.map(it => `frame:${it.includes(' ') ? '"' : ''}${it.toLocaleLowerCase()}${it.includes(' ') ? '"' : ''}`)
}

export function subtypeQueries(cards: OrderedCard[]): string[] {
    const typeSet = new Set<string>()
    for (const card of cards) {
        if (!card.type_line) continue;
        if (!card.type_line.includes("—")) continue;
        const subtypes = card.type_line
          .replaceAll(/(^|\/\/).*?—/g, "")
          .trim()
          .split(/\s+/)

        for (const subtype of subtypes) {
            typeSet.add(subtype);
        }
    }
    const sorted = Array.from(typeSet).sort()
    return sorted.map(it => {
        const quoteIt = /[ '’]/.test(it);
        return `t:${quoteIt ? '"' : ''}${it.toLocaleLowerCase()}${quoteIt ? '"' : ''}`
    })

}