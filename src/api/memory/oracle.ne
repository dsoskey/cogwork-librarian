@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { oracleFilters } = require('./filter')
%}

main -> filterStart {% id %}

filterStart ->
      _ {% () => oracleFilters.identity() %}
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
        return oracleFilters.not(inner)
    }
    return inner
} %}

connector ->
      (null | "and"i __) {% () => oracleFilters.and %}
    | "or"i __           {% () => oracleFilters.or %}

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


# TODO: Why does anyOperator get wrapped in an array?
cmcCondition -> ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.defaultOperation('cmc', operator, value) %}

nameCondition -> ("name"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => oracleFilters.textMatch('name', value) %} |
    stringValue {% ([value]) => oracleFilters.textMatch('name', value) %}

nameRegexCondition -> ("name"i) (":" | "=") regexString
    {% ([_, [operator], value]) => oracleFilters.regexMatch('name', value) %} |
    regexString {% ([value]) => oracleFilters.regexMatch('name', value) %}

colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => oracleFilters.colorMatch(operator, new Set(value)) %}

colorIdentityCondition -> ("ci"i | "identity"i | "id"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => oracleFilters.colorIdentityMatch(operator, new Set(value)) %}

manaCostCondition -> ("mana"i | "m"i) anyOperator manaCostValue
    {% ([_, [operator], value]) => oracleFilters.manaCostMatch(operator, value) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => oracleFilters.noReminderTextMatch('oracle_text', value) %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") regexString
    {% ([_, [operator], value]) => oracleFilters.noReminderRegexMatch('oracle_text', value) %}

fullOracleCondition -> ("fo"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => oracleFilters.textMatch('oracle_text', value) %}

fullOracleRegexCondition -> ("fo"i) (":" | "=") regexString
    {% ([_, [operator], value]) => oracleFilters.regexMatch('oracle_text', value) %}

keywordCondition -> "keyword"i (":" | "=") stringValue
    {% ([_, [operator], value]) => oracleFilters.keywordMatch(value) %}

typeCondition -> ("t"i | "type"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => oracleFilters.textMatch('type_line', value) %}

typeRegexCondition -> ("t"i | "type"i) (":" | "=") regexString
    {% ([_, [operator], value]) => oracleFilters.regexMatch('type_line', value) %}

powerCondition -> ("pow"i | "power"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.powTouOperation('power', operator, value) %}

toughCondition -> ("tou"i | "toughness"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.powTouOperation('toughness', operator, value) %}

loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.powTouOperation('loyalty', operator, value) %}

layoutCondition -> ("layout"i) equalityOperator stringValue
    {% ([_, [operator], value]) => oracleFilters.defaultOperation('layout', operator, value) %}

formatCondition -> ("format"i | "f"i) equalityOperator formatValue
    {% ([_, [operator], value]) => oracleFilters.formatMatch('legal', value) %}

bannedCondition -> "banned"i equalityOperator formatValue
    {% ([_, [operator], value]) => oracleFilters.formatMatch('banned', value) %}

restrictedCondition -> "restricted"i equalityOperator formatValue
    {% ([_, [operator], value]) => oracleFilters.formatMatch('restricted', value) %}

isCondition -> "is"i ":" isValue
    {% ([_, [operator], value]) => oracleFilters.isVal(value) %}

# print-matters
rarityCondition -> ("r"i | "rarity"i) anyOperator rarityValue
    {% ([_, [operator], value]) => oracleFilters.rarityFilter(operator, value) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) equalityOperator stringValue
    {% ([_, [operator], value]) => oracleFilters.setFilter(value) %}

setTypeCondition -> "st"i equalityOperator stringValue
    {% ([_, [operator], value]) => oracleFilters.setTypeFilter(value) %}

@include "./values.ne"