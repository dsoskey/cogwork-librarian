### @defaultWeight

`@defaultWeight` changes how the aggregator weighs each subquery in a query set.
this directive should be placed in its own paragraph.

possible values:
- `zipf (%)`: default behavior. queries are weighted by a zipf distribution `f(x) = (1/1+x)`
- `ord (#)`: queries are weighted by `f(x) = len(query set) - x`
- `uniform (=)`: all queries have the same weight. `f(x) = 1`

