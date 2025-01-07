### Generic planeswalker reanimation

The base query uses a regex to find several kinds of reanimation
effects with a single oracle text search. `.*`, regex-speak for finding any number of any kind of character,
matches any type or quantity of reanimation target. The subqueries filter out
most reanimation spells whose text doesn't mention planeswalkers or
permanents. This query is easier to assemble than one that accounts for
all reanimation variants in the regex, and it still filters out ~80% of
the cards of the base query (385 --> 47 pre-ONE)

```scryfall-extended-multi
o:/return .* from (your|a) graveyard to the battlefield/
o:planeswalker
o:permanent
```

### Blending morph & blink

this query shows how comments work. as written, this ignores the morph
subquery. remove the `#` from the first query to include them at the front of the search.
the two blink queries are separated to rank immediate blinks from end of turn blinks.

```scryfall-extended-multi
ci:wurg
# o:morph or o:manifest
o:/exile .* creature .*, then return (it|that card) to the battlefield/
o:/exile .* creature. return (it|that card) to the battlefield/
o:/when ~ enters the battlefield/
```

### Savai sacrifice

```scryfall-extended-multi
-is:extra ci:savai o:/sacrifice an? *./
# good sacrifice payoffs
o:/draw .* cards?/
o:/deals? .* damage/
o:/loses? .* life/
o:/gains? .* life/
o:scry or kw:"surveil"
t:creature
-t:planeswalker -t:creature
# subquery 8 is a fallback query
*
# A fallback query is any query that overlaps with the base query.
# Use a fallback query to include the entire base domain in the search results.
# *, the identity filter that matches all cards, is the most concise way to do thi
```

### Ketria spellslinger

```scryfall-extended-multi
c<=urg o:/(?<!(only as an? ))(instant|sorcery)/ -o:flash
t:instant
t:creature
t:enchantment
t:artifact
t:sorcery
c>=ur
c>=rg
c>=gu
```

### Non-red poison-matters in an artifact-matters environment

This query uses a full oracle text search (`fo:`), which includes reminder
text. This ensures toxic, proliferate, and infect are included in the
base query.

```scryfall-extended-multi
fo:counter ci:bwug
o:toxic
o:proliferate
o:infect
t:artifact
*
```

### Skill checks

This search identifies card printings that may read poorly to new cube drafters, from unintuitive mechanics to errata'd rules text.

```scryfall-extended-multi
# Uncomment this to search sub-queries one at a time
#@dm:solo

# Replace soskgy with your cube id
cube=soskgy
kw:protection
o:/\bregenerate\b/
atag:textless
# ~~~ text updates in order of mattering ~~~
# planeswalker redirection rule
date<dom (o:"target opponent or planeswalker" or o:"target player or planeswalker." or o:"damage to any target")
# dies
o:/\bdies\b/ date<isd
# exile
fo:/\bexile\b/ date<m10
# etb
fo:/\benters\b/ date<blb
# surveil, has a few false positives
kw:surveil date<unf -set:mh2 -set:grn -is:reprint
# creating tokens
o:create o:token date<kld
# type changes
t:kindred date<mh3 
t:planeswalker date<xln
t:wall date<9ed order:released
!tarmogoyf set:fut
# damage no longer uses the stack
((t:creature fo:"sacrifice ~:") or fo:/sacrifice .* creatures?:/) date<m10
# bury
date>=3ed date<tmp (o:/destroy .* be regenerated/ or (o:/sacrifices? / -o:/sacrifice.*:/ -o:"as an additional cost") or "Lake of the Dead")
o:/\bindestructible\b/ date<ths
o:"can't be blocked." date<ths
```

