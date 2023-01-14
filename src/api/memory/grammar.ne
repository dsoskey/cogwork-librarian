@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { Filters } = require('./filter')
%}


main -> filterStart {% id %}

filterStart ->
      _ {% () => Filters.identity() %}
    | _ filter _ {% ([, filter]) => {
        console.log(filter)
        return filter
    } %}

filter ->
      filter __ connector clause {% ([clause1, _, connectorFunc, clause2]) => {
        return connectorFunc(clause1, clause2)
      } %}
    | clause {% id %}

clause -> "-":? (
      "(" filter ")" {% ([_, f]) => [f] %}
    | condition
) {% ([negation, [inner]]) => {
    if (negation) {
        return Filters.not(inner)
    }
    return inner
} %}

connector ->
      (null | "and"i __) {% () => Filters.and %}
    | "or"i __           {% () => Filters.or %}

condition -> (
    cmcCondition |
    oracleCondition |
    oracleRegexCondition |
    powerCondition |
    toughCondition
) {% ([[condition]]) => condition %}

# TODO: Why does anyOperator get wrapped in an array?
cmcCondition -> ("mv"i | "cmc"i) anyOperator integerValue {% ([_, [operator], value]) => Filters.defaultOperation('cmc', operator, value) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue {% ([_, [operator], value]) => Filters.oracleText(value) %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) ":" regexString {% ([_, [operator], value]) => Filters.oracleRegex(value) %}

stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value.toLowerCase() %}

powerCondition -> ("pow"i | "power"i) anyOperator integerValue {% ([_, [operator], value]) => Filters.powTouOperation('power', operator, value.toString()) %}

toughCondition -> ("tou"i | "tough"i | "toughness"i) anyOperator integerValue {% ([_, [operator], value]) => Filters.powTouOperation('toughness', operator, value.toString()) %}

regexString -> "/" [^/]:* "/"  {% function(d) {return d[1].join(""); } %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<" | "<=" | ">" | ">=" {% id %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

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