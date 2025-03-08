### sets

Find cards in specific sets/blocks with `set`/`block`, respectively.
`in` finds all printings of a card that was printed in a specific set. 
- aliases: `s`, `set`, `e`, `edition` and `b`, `block`
- operators: `:`, `=`
- valid input: 1 or more set codes separated by commas, full set/block names

Set type (`st`) filters on broad classifications of sets.
- aliases: `st`
- operators: `:`, `=`
- valid types: `core`, `expansion`, `masters`, `alchemy`, `masterpiece`, 
`arsenal`, `from_the_vault`, `spellbook`, `premium_deck`, `duel_deck`,
`draft_innovation`, `treasure_chest`, `commander`, `planechase`, `archenemy`,
`vanguard`, `funny`, `starter`, `box`, `promo`, `token`, `memorabilia`, `minigame`

Use `number` to filter to collector number ranges.
- aliases: `cn`, `number`
- operators: `:`, `=`, `<`, `<=`, `>`, `>=`, `!=`, `<>`
- valid input: numbers