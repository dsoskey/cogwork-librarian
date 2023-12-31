### Editor basics

The editor is the first part of your brainstorming canvas.
Here you can write multiple Scryfall-like queries in different forms and comments about these queries.
Separate query sets with an empty line.
Query sets can be a simple single-line query or a multiline query that uses the [base/sub query model](#basesub-query-model).
Comments are lines that start with the `#` symbol.
Cogwork Librarian ignores these lines when parsing query sets.
Search a query set by pressing the ▶️ button next to a query set's base query or
by using the keyboard shortcut `CTRL + ENTER` while the cursor is within the query set.

```scryfall-extended-multi
# Each paragraph is its own query set. Comments start with `#`

# Single queries work great in their own paragraph!
# Press ▶️ next to the next line to run the query.
t:land o:sacrifice

# A query set with multiple queries uses the base/sub model.
# The base query is the domain for all subqueries.
-is:extra ci:savai o:/sacrifice an? *./
# Each subquery is weighted by its rank and 
# contribute to the result ordering.
o:/draw .* cards?/
o:/deals? .* damage/
o:/loses? .* life/
o:/gains? .* life/
o:/scry/
t:creature
-t:planeswalker -t:creature
ci:savai
```