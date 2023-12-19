## Database basics

Cogwork Librarian stores cards, oracle/illustration tags, and cube lists in a local database.
By default, it loads the "Default Cards" [bulk data](https://scryfall.com/docs/api/bulk-data) file from Scryfall
and all tags. Whenever you refresh card data, Cogwork Librarian automatically downloads updated tags.
For most use cases, the bulk data files are sufficient sources of card data.
Use "import from a file/text list" when you want to limit the database to a specific subset of cards or to
add custom cards to the database.

Cubes are managed separately from cards and tags. Load and refresh cubes by Cubecobra cube id,
or paste in a list of exact card names.

_Note: if you are interested in automatic data refreshing, [let us know!]()_
