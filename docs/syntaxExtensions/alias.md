### @alias & @use

similar to defining a function in programming languages, 
`@alias` defines a single query that you can reuse with the `@use` directive.
aliases are defined in their own paragraph and cannot use other aliases.

```scryfall-extended-multi
# Aliases let you define a query once and use it in other query sets
# Define aliases in their own paragraph in the format `@alias:NAME(QUERY)`
# Press ▶️ next to the alias definition to run it as its own query
@alias:innistrad(s:vow or s:mid or s:ema or s:soi or s:avr or s:dka or s:isd unique:cards)

@alias:importantTypes(t:zombie or t:spirit or t:human or t:vampire or t:werewolf)

# The @use extension tells cogwork librarian where to add the alias of a matching name
@use:innistrad
o:graveyard
o:mill
o:flashback
o:create
@use:importantTypes

# This becomes much more powerful when reusing the same alias in multiple query sets
@use:innistrad t:land

@use:importantTypes o:/other .* you control/
```