### @alias & @use

Aliases let you define a query once and use it in other query sets
Define aliases in their own paragraph in the format `@alias:NAME(QUERY)`
Press ▶️ next to the alias definition to run it as its own query

```scryfall-extended-multi
@alias:innistrad(s:vow,mid,ema,soi,avr,dka,isd unique:cards)

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

Aliases can use other aliases as long as those aliases don't form a cycle.
```scryfall-extended-multi
# Example of a cycle
@alias:a(@use:b)

@alias:b(@use:c)

# cogwork librarian identifies cycle here
@alias:c(@use:a)
```