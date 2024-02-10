import { FilterNode } from './base'
import { printNode } from './print'
import _isEqual from 'lodash/isEqual'

type NewValue = "rarity" | "flavor" | "art" | "artist" | "frame" | "language" | "game" | "paper" | "mtgo" | "arena" | "nonfoil" | "foil"

export function newFilter(value: NewValue): FilterNode {
  return printNode(["new"], ({printing, card}) => {
    let getField;
    switch (value) {
      case 'game': {
        const games = new Set();
        for (const p of card.printings) {
          if (p.id === printing.id) {
            break;
          }
          p.games.forEach(it => games.add(it));
        }
        return printing.games.find(it => !games.has(it)) !== undefined
      }
      case 'paper':
      case 'mtgo':
      case 'arena': // new:arena is adding a bunch of extra cards, looking like from not main sets
        return (!printing.reprint && printing.games.includes(value))
          || _isEqual(card.printings.find(it => it.games.includes(value)), printing)
      case 'rarity':
        getField = (current) => current.rarity;
        break;
      case 'flavor':
        getField = (current) => current.flavor_text;
        break;
      case 'art':
        getField = (current) => current.illustration_id;
        break;
      case 'artist':
        getField = (current) => current.artist;
        break;
      case 'frame':
        getField = (current) => current.frame;
        break;
      case 'language':
        getField = (current) => current.lang;
        break;
      case 'nonfoil':
      case 'foil':
        getField = (current) => current[value]
    }
    return _isEqual(card.printings.find(it => getField(it) !== undefined && getField(it) === getField(printing)), printing)
  })
}