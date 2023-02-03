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
        console.debug(filter)
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
    colorCondition |
    colorIdentityCondition |
    nameCondition |
    nameRegexCondition |
    oracleCondition |
    oracleRegexCondition |
    keywordCondition |
    typeCondition |
    typeRegexCondition |
    powerCondition |
    toughCondition |
    loyaltyCondition |
    layoutCondition |
    isCondition
) {% ([[condition]]) => condition %}

# TODO: Why does anyOperator get wrapped in an array?
cmcCondition -> ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
    {% ([_, [operator], value]) => Filters.defaultOperation('cmc', operator, value) %}

# TODO: Investigate name search with no field prefix
nameCondition -> ("name"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => Filters.textMatch('name', value) %}

nameRegexCondition -> ("name"i) (":" | "=") regexString
    {% ([_, [operator], value]) => Filters.regexMatch('name', value) %}

colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => Filters.colorMatch(operator, new Set(value)) %}

colorIdentityCondition -> ("ci"i | "identity"i | "id"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => Filters.colorIdentityMatch(operator, new Set(value)) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => Filters.textMatch('oracle_text', value) %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") regexString
    {% ([_, [operator], value]) => Filters.regexMatch('oracle_text', value) %}

keywordCondition -> "keyword"i (":" | "=") stringValue
    {% ([_, [operator], value]) => Filters.keywordMatch(value) %}

typeCondition -> ("t"i | "type"i) (":" | "=") stringValue
    {% ([_, [operator], value]) => Filters.textMatch('type_line', value) %}

typeRegexCondition -> ("t"i | "type"i) (":" | "=") regexString
    {% ([_, [operator], value]) => Filters.regexMatch('type_line', value) %}

powerCondition -> ("pow"i | "power"i) anyOperator integerValue
    {% ([_, [operator], value]) => Filters.powTouOperation('power', operator, value) %}

toughCondition -> ("tou"i | "toughness"i) anyOperator integerValue
    {% ([_, [operator], value]) => Filters.powTouOperation('toughness', operator, value) %}

loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
    {% ([_, [operator], value]) => Filters.powTouOperation('loyalty', operator, value) %}

layoutCondition -> ("layout"i) equalityOperator stringValue
    {% ([_, [operator], value]) => Filters.defaultOperation('layout', operator, value) %}

isCondition -> "is"i ":" isValue
    {% ([_, [operator], value]) => Filters.isVal(value) %}


# Values
stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value.toLowerCase() %}

regexString -> "/" [^/]:* "/"  {% function(d) {return d[1].join(""); } %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<=" | "<" | ">=" | ">" {% id %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

isValue -> (
    "gold"i | "twobrid"i | "hybrid"i | "phyrexian"i | "promo"i | "reprint"i | "firstprint"i | "firstprinting"i | "digital"i
  | "dfc"i | "mdfc"i |"tdfc"i | "extra"i
  | "meld"i | "transform"i | "split"i | "flip"i | "leveler"i | "commander"i | "spell"i | "permanent"i | "historic"i
  | "vanilla"i | "modal"i | "fullart"i | "foil"i | "nonfoil"i | "etched"i | "token"i
  | "bikeland"i | "cycleland"i | "bicycleland"i | "bounceland"i | "karoo"i | "canopyland"i | "canland"i | "fetchland"i
  | "checkland"i | "dual"i | "fastland"i | "filterland"i | "gainland"i | "painland"i | "scryland"i | "shadowland"i | "snarl"i
  | "slowland"i | "shockland"i | "storageland"i | "creatureland"i | "manland"i | "triland"i | "triome"i | "tangoland"i | "battleland"i
) {% ([[category]]) => category.toLowerCase() %}

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

# https://github.com/dekkerglen/CubeCobra/blob/dfbe1bdea3020cf4c619d6c6b360efe8e78f100f/nearley/values.ne#L85
comb1[A] -> null {% () => [] %}
  | $A {% ([comb]) => comb %}

comb2[A, B] -> null {% () => [] %}
  | ( $A comb1[$B]
    | $B comb1[$A]
    ) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

comb3[A, B, C] -> null {% () => [] %}
  | ( $A comb2[$B, $C]
    | $B comb2[$A, $C]
    | $C comb2[$A, $B]
    ) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

comb4[A, B, C, D] -> null {% () => [] %}
  | ( $A comb3[$B, $C, $D]
    | $B comb3[$A, $C, $D]
    | $C comb3[$A, $B, $D]
    | $D comb3[$A, $B, $C]
    ) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

comb5NonEmpty[A, B, C, D, E] -> (
    $A comb4[$B, $C, $D, $E]
  | $B comb4[$A, $C, $D, $E]
  | $C comb4[$A, $B, $D, $E]
  | $D comb4[$A, $B, $C, $E]
  | $E comb4[$A, $B, $C, $D]
) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

colorCombinationValue ->
    ("c"i | "brown"i | "colorless"i) {% () => [] %}
  | "white"i {% () => ['w'] %}
  | "blue"i {% () => ['u'] %}
  | "black"i {% () => ['b'] %}
  | "red"i {% () => ['r'] %}
  | "green"i {% () => ['g'] %}
  | ("azorius"i) {% () => ['w', 'u'] %}
  | ("dimir"i) {% () => ['u', 'b'] %}
  | ("rakdos"i) {% () => ['b', 'r'] %}
  | ("gruul"i) {% () => ['r', 'g'] %}
  | ("selesnya"i) {% () => ['g', 'w'] %}
  | ("silverquill"i | "orzhov"i) {% () => ['w', 'b'] %}
  | ("prismari"i | "izzet"i) {% () => ['u', 'r'] %}
  | ("witherbloom"i | "golgari"i) {% () => ['b', 'g'] %}
  | ("lorehold"i | "boros"i) {% () => ['w', 'r'] %}
  | ("quandrix"i | "simic"i) {% () => ['u', 'g'] %}
  | ("brokers"i | "bant"i) {% () => ['w', 'u', 'g'] %}
  | ("obscura"i | "esper"i) {% () => ['w', 'u', 'b'] %}
  | ("maestros"i | "grixis"i) {% () => ['u', 'b', 'r'] %}
  | ("riveteers"i | "jund"i) {% () => ['b', 'r', 'g'] %}
  | ("cabaretti"i | "naya"i) {% () => ['w', 'r', 'g'] %}
  | ("savai"i | "dega"i | "mardu"i) {% () => ['w', 'b', 'r'] %}
  | ("ketria"i | "ceta"i | "temur"i) {% () => ['u', 'r', 'g'] %}
  | ("indatha"i | "necra"i | "abzan"i) {% () => ['w', 'b', 'g'] %}
  | ("raugrin"i | "raka"i | "jeskai"i) {% () => ['w', 'u', 'r'] %}
  | ("zagoth"i | "ana"i | "sultai"i) {% () => ['u', 'b', 'g'] %}
  | "chaos"i {% () => ['b','g','r','u'] %}
  | "aggression"i {% () => ['b','g','r','w'] %}
  | "altruism"i {% () => ['w','g','r','u'] %}
  | "growth"i {% () => ['b','g','w','u'] %}
  | "artifice"i {% () => ['b','w','r','u'] %}
  | ("rainbow"i | "fivecolor"i) {% () => ['w', 'u', 'b', 'r', 'g'] %}
  | comb5NonEmpty["w"i, "u"i, "b"i, "r"i, "g"i] {% ([comb]) => comb.map((c) => c.toLowerCase()) %}