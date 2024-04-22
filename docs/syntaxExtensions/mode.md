### @defaultMode

`@defaultMode` changes how the parser interprets a query set.
this directive should be placed in its own paragraph.

possible values:
- `basesub`: default behavior. 1st query is the base query, injects at the front of each subquery
- `ranked`: has no base query in list, each query is run on its own
