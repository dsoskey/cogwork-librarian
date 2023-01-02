@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { Filters } = require('./filter')
%}

main -> condition {% id %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<" | "<=" | ">" | ">=" {% id %}

# regexSearch -> "/" text "/" {% ([, text, ]) => text %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

condition -> (
    cmcCondition |
    oracleCondition
) {% ([[condition]]) => condition %}

# TODO: Why does anyOperator get wrapped in an array?
cmcCondition -> ("mv"i | "cmc"i) anyOperator integerValue {% ([_, [operator], value]) => Filters.defaultOperation('cmc', operator, value) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue {% ([_, [operator], value]) => Filters.oracleText(value) %}
# oracleRegexCondition -> ("oracle"i | "o"i | "text"i) ":" regexSearch {% ([_, [operator], value]) => Filters.defaultOperation('cmc', operator, value) %}

stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value.toLowerCase() %}

# anything that isn't a special character and isn't "and" or "or"
noQuoteStringValue -> 
  ("a"i | "an"i | "o"i) {% ([[value]]) => value.toLowerCase() %}
  | ([^aAoO\- \t\n"'\\=<>:] 
    | "a"i [^nN \t\n"'\\=<>:] 
    | "an"i [^dD \t\n"'\\=<>:] 
    | "and"i [^ \t\n"'\\=<>:] 
    | "o"i [^rR \t\n"'\\=<>:]
    | "or"i [^ \t\n"'\\=<>:]
    ) [^ \t\n"'\\=<>:]:* {% ([startChars, chars]) => startChars.concat(chars).join('').toLowerCase() %}
# "