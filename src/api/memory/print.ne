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
    isCondition |
    rarityCondition |
    setCondition |
    setTypeCondition
) {% ([[condition]]) => condition %}

# TODO: condense identities once print selection is working
cmcCondition -> ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
    {% ([_, [operator], value]) => printFilters.identity() %}

nameCondition -> ("name"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => printFilters.identity() %} |
    stringValue {% ([value]) => printFilters.identity() %}

nameRegexCondition -> ("name"i) (":" | "=") regexString
    {% ([_, [operator], value]) => printFilters.identity() %} |
    regexString {% ([value]) => printFilters.identity() %}

colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => printFilters.identity() %}

colorIdentityCondition -> ("ci"i | "identity"i | "id"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => printFilters.identity() %}

manaCostCondition -> ("mana"i | "m"i) anyOperator manaCostValue
    {% ([_, [operator], value]) => printFilters.identity() %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => printFilters.identity() %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") regexString
    {% ([_, [operator], value]) => printFilters.identity() %}

fullOracleCondition -> ("fo"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => printFilters.identity() %}

fullOracleRegexCondition -> ("fo"i) (":" | "=") regexString
    {% ([_, [operator], value]) => printFilters.identity() %}

keywordCondition -> "keyword"i (":" | "=") stringValue
    {% ([_, [operator], value]) => printFilters.identity() %}

typeCondition -> ("t"i | "type"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => printFilters.identity() %}

typeRegexCondition -> ("t"i | "type"i) (":" | "=") regexString
    {% ([_, [operator], value]) => printFilters.identity() %}

powerCondition -> ("pow"i | "power"i) anyOperator integerValue
    {% ([_, [operator], value]) => printFilters.identity() %}

toughCondition -> ("tou"i | "toughness"i) anyOperator integerValue
    {% ([_, [operator], value]) => printFilters.identity() %}

loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
    {% ([_, [operator], value]) => printFilters.identity() %}

layoutCondition -> ("layout"i) equalityOperator stringValue
    {% ([_, [operator], value]) => printFilters.identity() %}

formatCondition -> ("format"i | "f"i) equalityOperator formatValue
    {% ([_, [operator], value]) => printFilters.identity() %}

bannedCondition -> "banned"i equalityOperator formatValue
    {% ([_, [operator], value]) => printFilters.identity() %}

restrictedCondition -> "restricted"i equalityOperator formatValue
    {% ([_, [operator], value]) => printFilters.identity() %}

isCondition -> "is"i ":" isValue
    {% ([_, [operator], value]) => printFilters.identity() %}


# print-jawnald
rarityCondition ->  ("r"i | "rarity"i) anyOperator rarityValue
   {% ([_, [operator], value]) => printFilters.rarityFilter(operator, value) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) equalityOperator stringValue
    {% ([_, [operator], value]) => printFilters.setFilter(value) %}

setTypeCondition -> "st"i equalityOperator stringValue
    {% ([_, [operator], value]) => printFilters.setTypeFilter(value) %}

@include "./values.ne"
