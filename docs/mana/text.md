## mana

Filter cards by their mana cost `mana`. specify simple symbols as standalone characters (`W`, `2`, `S`, etc.)
and complex symbols inside curly braces (`{w/r}`, `{2/b}`, `{u/p}`).
Use [regular expressions]() to match complex patterns in a mana cost.
The `:` operator is equivalent to `>=` for this filter.
- aliases: `mana`, `m`
- operators: `:`, `=`, `<`, `<=`, `>`, `>=`, `!=`, `<>`
- values: set of symbols, regular expression


Filter cards by their mana value using `cmc`.
- aliases: `cmc`, `mv`
- operators: `:`, `=`, `<`, `<=`, `>`, `>=`, `!=`, `<>`
- values: number, `odd`, `even`


Filter cards by their devotion using `devotion`. Use identical mana symbols
- aliases: `devotion`
- operators: `:`, `=`, `<`, `<=`, `>`, `>=`, `!=`, `<>`
- values: one or more identical mana symbol