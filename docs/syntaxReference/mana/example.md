```scryfall-extended-multi
# cards that Urza's Saga can search
(mana=0 or mana=1) t:artifact

# cards with green/white hybrid symbols
mana:{w/g}

# cards that have phyrexian mana in the mana cost
mana:/\smp/

# cards that have at least 3 green devotion
devotion>=ggg
```