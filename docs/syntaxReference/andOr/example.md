```scryfall-extended-multi
# finds all artifact creatures
t:artifact and t:creature

# finds all artifacts, creatures, and artifact creatures
t:artifact or t:creature

# these two queries are equivalent
t:artifact t:creature
t:artifact and t:creature

# this query ensures all results are legendary
t:legendary (t:artifact or t:creature)

# this query would include non-legendary creatures
t:legendary t:artifact or t:creature
```