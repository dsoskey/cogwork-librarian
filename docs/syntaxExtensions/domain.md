### @defaultDomain

Each project can have a default domain, a query that's prepended to every query set in the project.
Default domain is defined in its own paragraph and can reference aliases.

```scryfall-extended-multi
@include:stdlib

# short version is @dd
@defaultDomain(-is:extra -cube:soskgy @use:newest)

year=2024
```