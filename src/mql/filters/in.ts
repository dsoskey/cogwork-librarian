import { FilterNode } from './base'
import { oracleNode } from './oracle'
import { setFilter, setTypeFilter } from './set'
import { gameFilter } from './game'
import { languageFilter } from './language'
import { rarityFilter } from './rarity'
import { frameFilter } from './frame'

const ignoreSetType = new Set([
  'from_the_vault',
  'promo',
  'memorabilia',
  'masterpiece',
])

const ignoreSetCode = new Set([
  'sld', 'slu'
])

export const inFilter = (value: string): FilterNode => {
  const _set = setFilter(value);
  const _setType = setTypeFilter(value);
  const _game = gameFilter(value);
  const _lang = languageFilter(value);
  const _frame = frameFilter(value);
  const _rarity = rarityFilter("=", value);
  return oracleNode({
    filtersUsed: ["in"],
    filterFunc: (card) => {
      return card.printings.filter(
        printing => _set({ printing, card }) ||
          _frame({ printing, card }) ||
          _setType({ printing, card }) ||
          _game({ printing, card }) ||
          _lang({ printing, card }) ||
          (_rarity({ printing, card })
            && !ignoreSetType.has(printing.set_type)
            && !ignoreSetCode.has(printing.set)
          )
      ).length > 0
    }
  })
}

