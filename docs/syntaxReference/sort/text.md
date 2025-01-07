### order & direction

Control the order of your results using `order:ORDER_VALUE` and `dir:DIRECTION`. `ascending` (`asc` for short) and `descending` (`desc`) are valid direction values.
By default, cogwork librarian sorts by mana value (`order:cmc`) and uses its default direction, ascending. 
If your query contains multiple order or direction clauses, only the first will be applied. This is opposite behavior of Scryfall, which uses the last clause.

#### order values

| Sort value             | Default direction  | Description                                                                                                                                           | Coglib support | Scryfall support |
|------------------------|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|------------------|
| `artist`               | Ascending (0-9a-z) | artist's full name in lexigraphical order, case insensitive                                                                                           | ✔              | ✔                |
| `cmc`, `mv`            | Ascending          | mana value                                                                                                                                            | ✔              | ✔                |
| `color`                | Ascending          | color in wubrgmc order. see [source code](https://github.com/dsoskey/mtgql-js/blob/main/src/filters/sort.ts#L30) for canonical multicolored ordering. | ✔              | ✔                |
| `edhrec`               | Descending         | edhrec rating                                                                                                                                         | ✔              | ✔                |
| `usd`, `eur`, `tix`    | Descending         | price in specified currency                                                                                                                           | ✔              | ✔                |
| `name`                 | Ascending (0-9a-z) | card name                                                                                                                                             | ✔              | ✔                |
| `penny`                | Ascending          | [Penny Dreadful](http://pdmtgo.com/) ranking                                                                                                          | ✔              | ✔                |
| `power`  , `toughness` | Ascending          | Combat stats. Cards without combat stats go before cards with 0 power/toughness                                                                       | ✔              | ✔                |
| `rarity`               | Ascending          | Order: common, uncommon, rare, special, mythic, bonus                                                                                                 | ✔              | ✔                |
| `released`             | Ascending          | Release date                                                                                                                                          | ✔              | ✔                |
| `review`               | Ascending          | By color, then by cmc                                                                                                                                 | ✔              | ✔                |
| `set`                  | Ascending          | sorts by set code, then collector number                                                                                                              | ✔              | ✔                |
| `spoiled`              | Ascending          | spoiled date                                                                                                                                          | ✔              | ✔                |
| `wc`                   | Ascending          | word count without reminder text                                                                                                                      | ✔              | –                |
| `fwc`                  | Ascending          | full word count (including reminder text)                                                                                                             | ✔              | –                |
| `random`               | N/A                | result is sorted in a random order. This is useful for [generating random cubes](/user-guide/advanced-techniques#generating-random-cubes)             | ✔              | –                |

