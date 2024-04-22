### @venn diagram search

```scryfall-extended-multi
# Use a venn diagram search to show the similarities and differences of two base queries.
# Format: @venn(<LEFT_QUERY>)(<RIGHT_QUERY>)
@venn(t:creature)(t:artifact)
# You can filter the base domains further, just like any other query set.
o:"+1/+1 counter"
ci:gw c>0

# This is especially helpful for comparing cube lists using the
# cube oracle (`cubeo`) filter. See the 'cube' tab to manage your cube lists.
@venn(cubeo:soskgy)(cubeo:blue-cube)
```