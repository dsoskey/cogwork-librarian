### Regular expressions

Most filters that operate on text can use a regular expression (aka RegEx) instead of a string.
This enables you to match complex text patterns within card fields, like 
Cogwork Librarian uses Javascript's flavor of RegEx and supports Scryfall's custom [extension symbols](https://scryfall.com/docs/regular-expressions#scryfall-extensions).

| Symbol | What it means                                   |
|--------|-------------------------------------------------|
| \spt   | matches X/X power/toughness                     |
| \spp   | matches +X/+X power/toughness                   |
| \smm   | matches -X/-X power/toughness                   |
| \smr   | matches repeated mana symbols                   |
| \smh   | matches any hybrid mana symbol                  |
| \smp   | matches any phyrexian mana symbol               |
| \sm    | matches any mana symbol                         |
| \sc    | matches any colored mana symbol                 |
| \ss    | matches any card symbol (mana, tap, untap, etc) |

For the ultimate source of truth, see the symbol expansions [here]()