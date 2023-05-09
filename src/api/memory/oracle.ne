@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { oracleFilters } = require('./oracleFilter')
const { identity } = require('./filters/base')
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
      # is this where i put the plain text search?
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
    exactNameCondition |
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
    powTouCondition |
    loyaltyCondition |
    layoutCondition |
    formatCondition |
    bannedCondition |
    restrictedCondition |
    isCondition |
    notCondition |
    inCondition |
    rarityCondition |
    setCondition |
    setTypeCondition |
    artistCondition |
    borderCondition |
    collectorNumberCondition |
    dateCondition |
    frameCondition |
    flavorCondition |
    flavorRegexCondition |
    gameCondition |
    languageCondition |
    priceCondition |
    stampCondition |
    watermarkCondition |
    cubeCondition |
    producesCondition |
    uniqueCondition |
    orderCondition |
    directionCondition |
    devotionCondition
) {% ([[condition]]) => condition %}


cmcCondition -> ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
    {% ([_, [operator], value]) => ({
        filtersUsed: ["cmc"],
        filterFunc: oracleFilters.defaultOperation('cmc', operator, value),
    }) %}

exactNameCondition -> "!" stringValue
    {% ([op, value]) => ({
        filtersUsed: ["exact"],
        filterFunc: oracleFilters.exactMatch('name', value)
    })%}

nameCondition -> ("name"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["name"],
        filterFunc: oracleFilters.textMatch('name', value)
    })%}

nameRegexCondition -> ("name"i) (":" | "=") regexString
    {% ([_, [_op], value]) => ({
        filtersUsed: ["name"],
        filterFunc: oracleFilters.regexMatch('name', value)
    })%}

colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => ({
        filtersUsed: ["color"],
        filterFunc: oracleFilters.colorMatch(operator, new Set(value)),
    }) %}

colorIdentityCondition -> ("ci"i | "commander"i | "identity"i | "id"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => ({
        filtersUsed: ["identity"],
        filterFunc: oracleFilters.colorIdentityMatch(operator, new Set(value)),
    }) %}

manaCostCondition -> ("mana"i | "m"i) anyOperator manaCostValue
    {% ([_, [operator], value]) => ({
        filtersUsed: ["mana"],
        filterFunc: oracleFilters.manaCostMatch(operator, value),
    }) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["oracle"],
        filterFunc: oracleFilters.noReminderTextMatch('oracle_text', value),
    }) %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") regexString
    {% ([_, [_op], value]) => ({
        filtersUsed: ["oracle"],
        filterFunc: oracleFilters.noReminderRegexMatch('oracle_text', value),
    }) %}

fullOracleCondition -> ("fo"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["full-oracle"],
        filterFunc: oracleFilters.textMatch('oracle_text', value),
    }) %}

fullOracleRegexCondition -> ("fo"i) (":" | "=") regexString
    {% ([_, [_op], value]) => ({
        filtersUsed: ["full-oracle"],
        filterFunc: oracleFilters.regexMatch('oracle_text', value),
    }) %}

keywordCondition -> "keyword"i (":" | "=") stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["full-oracle"],
        filterFunc: oracleFilters.keywordMatch(value),
    }) %}

typeCondition -> ("t"i | "type"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["type"],
        filterFunc: oracleFilters.textMatch('type_line', value),
    }) %}

typeRegexCondition -> ("t"i | "type"i) (":" | "=") regexString
    {% ([_, [_op], value]) => ({
        filtersUsed: ["type"],
        filterFunc: oracleFilters.regexMatch('type_line', value),
    }) %}

powerCondition -> ("pow"i | "power"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.combatOperation('power', operator, value) %}

toughCondition -> ("tou"i | "toughness"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.combatOperation('toughness', operator, value)  %}

powTouCondition -> ("pt"i | "powtou"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.powTouTotalOperation(operator, value) %}

loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.combatOperation('loyalty', operator, value) %}

layoutCondition -> ("layout"i) equalityOperator stringValue
    {% ([_, [operator], value]) => ({
        filtersUsed: ["layout"],
        filterFunc: oracleFilters.defaultOperation('layout', operator, value),
    }) %}

formatCondition -> ("format"i | "f"i) equalityOperator formatValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["format"],
        filterFunc: oracleFilters.formatMatch('legal', value),
    }) %}

bannedCondition -> "banned"i equalityOperator formatValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["banned"],
        filterFunc: oracleFilters.formatMatch('banned', value),
    }) %}

restrictedCondition -> "restricted"i equalityOperator formatValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["restricted"],
        filterFunc: oracleFilters.formatMatch('restricted', value),
    }) %}

isCondition -> ("is"i | "has"i) ":" isValue
    {% ([_, [_op], value]) => oracleFilters.isVal(value) %}

notCondition -> "not"i ":" isValue
    {% ([_, [_op], value]) => oracleFilters.not({
        filtersUsed: ["is"],
        filterFunc: oracleFilters.isVal(value),
    }) %}

inCondition -> "in"i ":" stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: ["in"],
        filterFunc: oracleFilters.inFilter(value),
    }) %}

producesCondition ->
    "produces"i anyOperator producesCombinationValue
        {% ([_, [operator], value]) => ({
            filtersUsed: ["produces"],
            filterFunc: oracleFilters.producesMatch(operator, new Set(value)),
        }) %} |
    "produces"i anyOperator integerValue
        {% ([_, [operator], value]) => ({
            filtersUsed: ["produces"],
            filterFunc: oracleFilters.producesMatchCount(operator, value),
        }) %}

devotionCondition -> "devotion"i anyOperator devotionValue
    {% ([_, [operator], [pips]]) => oracleFilters.devotionOperation(operator, pips) %}

uniqueCondition -> "unique"i ":" ("cards"i | "prints"i | "art"i)
    {% ([_, [operator], value]) => ({
        filtersUsed: [`unique:${value}`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %}

orderCondition -> "order"i ":" orderValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [`order:${value}`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %}

directionCondition -> "direction"i ":" ("asc"i | "desc"i)
    {% ([_, [operator], value]) => ({
        filtersUsed: [`direction:${value}`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %}

# print-matters
# todo: oracleFilter defines the object structure that's returned
rarityCondition -> ("r"i | "rarity"i) anyOperator rarityValue
    {% ([_, [operator], value]) => oracleFilters.rarityFilter(operator, value) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.setFilter(value) %}

setTypeCondition -> "st"i equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.setTypeFilter(value) %}

artistCondition -> ("a"i | "artist"i) equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.artistFilter(value) %}

collectorNumberCondition -> ("cn"i | "number"i) anyOperator integerValue
    {% ([_, [operator], value]) => oracleFilters.collectorNumberFilter(operator, value) %}

borderCondition -> "border"i equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.borderFilter(value) %}

dateCondition -> ("date"i | "year"i) anyOperator stringValue
    {% ([_, [operator], value]) => oracleFilters.dateFilter(operator, value) %}

priceCondition -> ("usd"i | "eur"i | "tix"i) anyOperator numberValue
    {% ([unit, [operator], value]) => oracleFilters.priceFilter(unit, operator, value) %}

frameCondition -> "frame"i equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.frameFilter(value) %}

flavorCondition -> ("flavor"i | "ft"i) equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.flavorMatch(value) %}

flavorRegexCondition -> ("flavor"i | "ft"i) equalityOperator regexString
    {% ([_, [_op], value]) => oracleFilters.flavorRegex(value) %}

gameCondition -> "game"i equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.gameFilter(value) %}

languageCondition -> ("lang"i | "language"i) equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.languageFilter(value) %}

stampCondition -> "stamp"i equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.stampFilter(value) %}

watermarkCondition -> ("wm"i | "watermark"i) equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.watermarkFilter(value) %}

cubeCondition -> "cube"i equalityOperator stringValue
    {% ([_, [_op], value]) => oracleFilters.cubeFilter(value) %}

@include "./values.ne"