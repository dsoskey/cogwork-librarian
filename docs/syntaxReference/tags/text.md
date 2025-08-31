### tags

Cogwork Librarian supports [Scryfall's human-curated tags](https://scryfall.com/docs/tagger-tags) and CubeCobra tags.
Oracle tags (`otag`) are a quick way to shortcut more complex queries or categorize effects that don't map to a single query.
- aliases: `otag`, `oracletag`, `function`
- operators: `:`, `=`
- valid inputs: rawtext

Illustration tags (`atag`) are critical for finding cards that fit an aesthetic goal instead of a purely mechanical one.
- aliases: `atag`, `arttag`, `art`
- operators: `:`, `=`
- valid inputs: rawtext

#### Cube tags
When filtering a cube on the [cube list page](/cube/soskgy/list) or [cube search page](/cube/soskgy/table), search for cube tags with `tag:tagname`.
This is equivalent to using `cube:cubeid.tagname`.