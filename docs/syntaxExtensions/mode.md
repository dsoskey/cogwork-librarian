### @defaultMode

`@defaultMode` changes how the parser interprets a query set.
this directive should be placed in its own paragraph.

possible values:
- `sub` (previously `basesub`): default behavior. 1st query is the base query, injects at the front of each subquery
- `solo`
  - when you press the ▶️ button, the parser uses only the base query
  - when you use CMD+Enter, the parser combines base query and the sub query your editor cursor is on. Other subqueries are ignored
- `all` (previously `allsub`): has no base query in list, each query is run on its own