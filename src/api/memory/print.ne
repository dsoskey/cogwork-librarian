@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { printFilters } = require('./printFilter')
%}

filterStart ->
      _ {% () => printFilters.identity() %}
    | _ filter _ {% ([, filter]) => {
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
        return printFilters.not(inner)
    }
    return inner
} %}

connector ->
      (null | "and"i __) {% () => printFilters.and %}
    | "or"i __           {% () => printFilters.or %}

condition -> (
    cmcCondition |
    colorCondition |
    colorIdentityCondition |
    manaCostCondition |
    nameCondition |
    nameRegexCondition |
    oracleCondition |
    oracleRegexCondition |
    fullOracleCondition |
    fullOracleRegexCondition |
    keywordCondition |
    typeCondition |
    typeRegexCondition |
    powerCondition |
    toughCondition |
    loyaltyCondition |
    layoutCondition |
    formatCondition |
    bannedCondition |
    restrictedCondition |
    isCondition
) {% () => printFilters.oracleFilter() %} | (
    rarityCondition |
    setCondition |
    setTypeCondition
) {% ([[condition]]) => condition %}

cmcCondition -> ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
nameCondition -> ("name"i) (":" | "=") stringValue | stringValue
nameRegexCondition -> ("name"i) (":" | "=") regexString | regexString
colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
colorIdentityCondition -> ("ci"i | "identity"i | "id"i) anyOperator colorCombinationValue
manaCostCondition -> ("mana"i | "m"i) anyOperator manaCostValue
oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue
oracleRegexCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") regexString
fullOracleCondition -> ("fo"i) (":" | "=") stringValue
fullOracleRegexCondition -> ("fo"i) (":" | "=") regexString
keywordCondition -> "keyword"i (":" | "=") stringValue
typeCondition -> ("t"i | "type"i) (":" | "=") stringValue
typeRegexCondition -> ("t"i | "type"i) (":" | "=") regexString
powerCondition -> ("pow"i | "power"i) anyOperator integerValue
toughCondition -> ("tou"i | "toughness"i) anyOperator integerValue
loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
layoutCondition -> ("layout"i) equalityOperator stringValue
formatCondition -> ("format"i | "f"i) equalityOperator formatValue
bannedCondition -> "banned"i equalityOperator formatValue
restrictedCondition -> "restricted"i equalityOperator formatValue
isCondition -> "is"i ":" isValue

# print-specific
rarityCondition ->  ("r"i | "rarity"i) anyOperator rarityValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.rarityFilter(operator, value)
    }) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) equalityOperator stringValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.setFilter(value)
    }) %}

setTypeCondition -> "st"i equalityOperator stringValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.setTypeFilter(value)
    }) %}

@include "./values.ne"
