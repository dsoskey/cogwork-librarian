```scryfall-extended-multi
# cards with the merfolk subtype
t:merfolk

# tip: combine multiple type queries 
# instead of using "t:"tribal goblin"
t:tribal t:goblin

t:legendary t:sorcery

# cards with type rat but ignores "pirate"
# \b looks for word boundaries, like spaces
t:/\brat\b/
```