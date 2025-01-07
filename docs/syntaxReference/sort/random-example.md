### Generating random cubes

Cogwork Librarian makes it simple to generate random cubes from a single query set.
Combine [order:random]() and [limit]() to generate the amount of each searchable effect.
Include `order:random` in your base query along with the card pool you want to pick from.
Each subquery represents the different kinds of cards you want in the cube; use `limit:N`
to set how many cards to randomly pick for a given subquery. To ensure you generate exactly the total number of 
cards you want in the cube, no subquery should overlap with any other subquery. In this example, the last subquery
includes `-t:land` to not overlap with the first subquery.

```scryfall-extended-multi
# include the standard library of aliases
@include:stdlib

# define your card pool
@alias:cardPool(f:pioneer fo<=25 @u:bar)

# exclude any mechanics you don't want in the environment
@alias:banlist(-keyword:hexproof -is:extra -border:silver)

# why tweak 5 knobs when you could tweak one?
@alias:monoColorLimit(limit:50)

# run this query to generate your cube
order:random @use:cardPool @use:banlist
# each subquery uses a limit filter to select that many cards
type:land produces=2 -produces:c limit:60
# each mono-color section uses the same limit as defined in monoColorLimit
color=w @u:monoColorLimit
c=u @u:monoColorLimit
c=b @u:monoColorLimit
c=r @u:monoColorLimit
c=g @u:monoColorLimit
c=2 lim:30
c:c -t:land lim:20
```