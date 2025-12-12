import { Card } from 'mtgql'

export const SCRYFALL_BASE_URI = 'https://api.scryfall.com'

export function scryfallCardLink(card: Card) {
  return `https://scryfall.com/card/${card.set}/${card.collector_number}`
}