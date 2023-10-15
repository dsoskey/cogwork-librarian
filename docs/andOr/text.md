## "and" and "or" operators

Combine multiple queries with a space, `and`, or `or`.
A space is equivalent to `and`. `and` requires a card match both operands to be included in the query.
`or` requires at least one operand to be true. These boolean operators evaluate left to right and avoid unnecessary query evaluations if possible.
`and` will ignore the right operand if the left is false, and
`or` will ignore the right operand if the right is true.