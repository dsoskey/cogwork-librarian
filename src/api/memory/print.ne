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
    cubeCondition |
    producesCondition |
    uniqueCondition |
    orderCondition |
    directionCondition |
    devotionCondition
) {% () => printFilters.oracleFilter() %} | (
    rarityCondition |
    setCondition |
    setTypeCondition |
    artistCondition |
    borderCondition |
    collectorNumberCondition |
    dateCondition |
    frameCondition |
#    flavorRegexCondition |
    flavorCondition |
    gameCondition |
    languageCondition |
    priceCondition |
    stampCondition |
    watermarkCondition
) {% ([[condition]]) => condition %}

cmcCondition -> ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
exactNameCondition -> "!" stringValue
nameCondition -> ("name"i) (":" | "=") stringValue | stringValue
nameRegexCondition -> ("name"i) (":" | "=") regexString | regexString
colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
colorIdentityCondition -> ("ci"i | "commander"i | "identity"i | "id"i) anyOperator colorCombinationValue
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
powTouCondition -> ("pt"i | "powtou"i) anyOperator integerValue
loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
layoutCondition -> ("layout"i) equalityOperator stringValue
formatCondition -> ("format"i | "f"i) equalityOperator formatValue
bannedCondition -> "banned"i equalityOperator formatValue
restrictedCondition -> "restricted"i equalityOperator formatValue
isCondition -> ("is"i | "has"i) ":" isValue
notCondition -> "not"i ":" isValue
inCondition -> "in"i ":" stringValue
cubeCondition -> "cube"i equalityOperator stringValue
producesCondition -> "produces"i anyOperator (producesCombinationValue | integerValue)
uniqueCondition -> "unique"i ":" ("cards"i | "prints"i | "art"i)
orderCondition -> "order"i ":" orderValue
directionCondition -> "direction"i ":" ("asc"i | "desc"i)
devotionCondition -> "devotion"i anyOperator devotionValue

# print-specific
rarityCondition ->  ("r"i | "rarity"i) anyOperator rarityValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.rarityFilter(operator, value)
    }) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.setFilter(value)
    }) %}

setTypeCondition -> "st"i equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.setTypeFilter(value)
    }) %}

artistCondition -> ("a"i | "artist"i) equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.artistFilter(value)
    }) %}

collectorNumberCondition -> ("cn"i | "number"i) anyOperator integerValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.collectorNumberFilter(operator, value),
    }) %}

borderCondition -> "border"i equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.borderFilter(value),
    }) %}

dateCondition -> ("date"i | "year"i) anyOperator stringValue
    {% ([_, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.dateFilter(operator, value),
    })%}

priceCondition -> ("usd"i | "eur"i | "tix"i) anyOperator numberValue
    {% ([unit, [operator], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.priceFilter(unit, operator, value),
    })%}

frameCondition -> "frame"i equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.frameFilter(value),
    }) %}

# TODO: disambiguiate regex from text
#flavorRegexCondition -> ("flavor"i | "ft"i) equalityOperator regexString
#    {% ([_, [_op], value]) => ({
#        filtersUsed: [],
#        filterFunc: printFilters.flavorRegex(value),
#    }) %}
flavorCondition -> ("flavor"i | "ft"i) equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.flavorMatch(value),
    }) %}

gameCondition -> "game"i equalityOperator stringValue
    {% ([_, [_op], value]) =>  ({
        filtersUsed: [],
        filterFunc: printFilters.gameFilter(value),
    }) %}

languageCondition -> ("lang"i | "language"i) equalityOperator stringValue
    {% ([_, [_op], value]) =>  ({
        filtersUsed: [],
        filterFunc: printFilters.languageFilter(value),
    }) %}

stampCondition -> "stamp"i equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.stampFilter(value),
    }) %}

watermarkCondition -> ("wm"i | "watermark"i) equalityOperator stringValue
    {% ([_, [_op], value]) => ({
        filtersUsed: [],
        filterFunc: printFilters.watermarkFilter(value),
    }) %}

@include "./values.ne"
