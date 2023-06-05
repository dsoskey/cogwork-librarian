@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { filters } = require('./filters')
const { identity } = require('./filters/base')
const { oracleNode } = require('./filters/oracle')
%}

main -> filterStart {% id %}

filterStart ->
      _ {% () => filters.identity() %}
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
        return filters.not(inner)
    }
    return inner
} %}

connector ->
      (null | "and"i __) {% () => filters.and %}
    | "or"i __           {% () => filters.or %}

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
    {% ([_, [operator], value]) => oracleNode({
        filtersUsed: ["cmc"],
        filterFunc: filters.defaultOperation('cmc', operator, value),
    }) %}

exactNameCondition -> "!":? stringValue
    {% ([op, value]) => oracleNode({
        filtersUsed: [op === "!" ? "exact" : "name"],
        filterFunc: op === "!" ? filters.exactMatch('name', value) : filters.textMatch('name', value)
    })%}

nameCondition -> ("name"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["name"],
        filterFunc: filters.textMatch('name', value)
    })%}

nameRegexCondition -> ("name"i) (":" | "=") regexString
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["name"],
        filterFunc: filters.regexMatch('name', value)
    })%}

colorCondition -> ("c"i | "color"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => filters.colorMatch(operator, new Set(value)) %}

colorIdentityCondition -> ("ci"i | "commander"i | "identity"i | "id"i) anyOperator colorCombinationValue
    {% ([_, [operator], value]) => filters.colorIdentityMatch(operator, new Set(value)) %}

manaCostCondition -> ("mana"i | "m"i) anyOperator manaCostValue
    {% ([_, [operator], value]) => filters.manaCostMatch(operator, value) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["oracle"],
        filterFunc: filters.noReminderTextMatch('oracle_text', value),
    }) %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) (":" | "=") regexString
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["oracle"],
        filterFunc: filters.noReminderRegexMatch('oracle_text', value),
    }) %}

fullOracleCondition -> ("fo"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["full-oracle"],
        filterFunc: filters.textMatch('oracle_text', value),
    }) %}

fullOracleRegexCondition -> ("fo"i) (":" | "=") regexString
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["full-oracle"],
        filterFunc: filters.regexMatch('oracle_text', value),
    }) %}

keywordCondition -> "keyword"i (":" | "=") stringValue
    {% ([_, [_op], value]) => filters.keywordMatch(value) %}

typeCondition -> ("t"i | "type"i) (":" | "=") stringValue
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["type"],
        filterFunc: filters.textMatch('type_line', value),
    }) %}

typeRegexCondition -> ("t"i | "type"i) (":" | "=") regexString
    {% ([_, [_op], value]) => oracleNode({
        filtersUsed: ["type-regex"],
        filterFunc: filters.regexMatch('type_line', value),
    }) %}

powerCondition -> ("pow"i | "power"i) anyOperator (integerValue | "tou"i | "toughness"i)
    {% ([_, [operator], [value]]) => filters.combatToCombatNode('power', operator, value) %}

toughCondition -> ("tou"i | "toughness"i) anyOperator (integerValue | "pow"i | "power"i)
    {% ([_, [operator], [value]]) => filters.combatToCombatNode('toughness', operator, value)  %}

powTouCondition -> ("pt"i | "powtou"i) anyOperator integerValue
    {% ([_, [operator], value]) => filters.powTouTotalOperation(operator, value) %}

loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
    {% ([_, [operator], value]) => filters.combatToCombatNode('loyalty', operator, value) %}

layoutCondition -> ("layout"i) equalityOperator stringValue
    {% ([_, [operator], value]) => oracleNode({
        filtersUsed: ["layout"],
        filterFunc: filters.defaultOperation('layout', operator, value),
    }) %}

formatCondition -> ("format"i | "f"i) equalityOperator formatValue
    {% ([_, [_op], value]) => filters.formatMatch('legal', value) %}

bannedCondition -> "banned"i equalityOperator formatValue
    {% ([_, [_op], value]) => filters.formatMatch('banned', value) %}

restrictedCondition -> "restricted"i equalityOperator formatValue
    {% ([_, [_op], value]) => filters.formatMatch('restricted', value) %}

isCondition -> ("is"i | "has"i) ":" isValue
    {% ([_, [_op], value]) => filters.isVal(value) %}

notCondition -> "not"i ":" isValue
    {% ([_, [_op], value]) => filters.not(filters.isVal(value)) %}

inCondition -> "in"i ":" stringValue
    {% ([_, [_op], value]) => filters.inFilter(value) %}

producesCondition ->
    "produces"i anyOperator producesCombinationValue
        {% ([_, [operator], value]) => oracleNode({
            filtersUsed: ["produces"],
            filterFunc: filters.producesMatch(operator, new Set(value)),
        }) %} |
    "produces"i anyOperator integerValue
        {% ([_, [operator], value]) => oracleNode({
            filtersUsed: ["produces"],
            filterFunc: filters.producesMatchCount(operator, value),
        }) %}

devotionCondition -> "devotion"i anyOperator devotionValue
    {% ([_, [operator], [pips]]) => filters.devotionOperation(operator, pips) %}

uniqueCondition -> "unique"i ":" ("cards"i | "prints"i | "art"i)
    {% ([_, [operator], value]) => oracleNode({
        filtersUsed: [`unique:${value}`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %} |
    "++" {% (_) => oracleNode({
        filtersUsed: [`unique:prints`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %} |
    "@@" {% (_) => oracleNode({
        filtersUsed: [`unique:art`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %}


orderCondition -> "order"i ":" orderValue
    {% ([_, [operator], value]) => oracleNode({
        filtersUsed: [`order:${value}`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %}

directionCondition -> "direction"i ":" ("asc"i | "desc"i)
    {% ([_, [operator], value]) => oracleNode({
        filtersUsed: [`direction:${value}`],
        filterFunc: identity(),
        inverseFunc: identity(),
    }) %}

# print-matters
rarityCondition -> ("r"i | "rarity"i) anyOperator rarityValue
    {% ([_, [operator], value]) => filters.rarityFilter(operator, value) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) equalityOperator stringValue
    {% ([_, [_op], value]) => filters.setFilter(value) %}

setTypeCondition -> "st"i equalityOperator stringValue
    {% ([_, [_op], value]) => filters.setTypeFilter(value) %}

artistCondition -> ("a"i | "artist"i) equalityOperator stringValue
    {% ([_, [_op], value]) => filters.artistFilter(value) %}

collectorNumberCondition -> ("cn"i | "number"i) anyOperator integerValue
    {% ([_, [operator], value]) => filters.collectorNumberFilter(operator, value) %}

borderCondition -> "border"i equalityOperator stringValue
    {% ([_, [_op], value]) => filters.borderFilter(value) %}

dateCondition -> ("date"i | "year"i) anyOperator stringValue
    {% ([_, [operator], value]) => filters.dateFilter(operator, value) %}

priceCondition -> ("usd"i | "eur"i | "tix"i) anyOperator numberValue
    {% ([[unit], [operator], value]) => filters.priceFilter(unit, operator, value) %}

frameCondition -> "frame"i equalityOperator stringValue
    {% ([_, [_op], value]) => filters.frameFilter(value) %}

flavorCondition -> ("flavor"i | "ft"i) equalityOperator stringValue
    {% ([_, [_op], value]) => filters.flavorMatch(value) %}

flavorRegexCondition -> ("flavor"i | "ft"i) equalityOperator regexString
    {% ([_, [_op], value]) => filters.flavorRegex(value) %}

gameCondition -> "game"i equalityOperator stringValue
    {% ([_, [_op], value]) => filters.gameFilter(value) %}

languageCondition -> ("lang"i | "language"i) equalityOperator stringValue
    {% ([_, [_op], value]) => filters.languageFilter(value) %}

stampCondition -> "stamp"i equalityOperator stringValue
    {% ([_, [_op], value]) => filters.stampFilter(value) %}

watermarkCondition -> ("wm"i | "watermark"i) equalityOperator stringValue
    {% ([_, [_op], value]) => filters.watermarkFilter(value) %}

cubeCondition -> "cube"i equalityOperator stringValue
    {% ([_, [_op], value]) => filters.cubeFilter(value) %}

# Values
stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value.toLowerCase() %}

regexString -> "/" [^/]:* "/"  {% function(d) {return d[1].join(""); } %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

numberValue -> [0-9]:* ("." [0-9]:+):?
    {% ([preDec, dec]) => parseFloat(`${preDec.flat().join('')}${dec?.flat().join('')}`) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<=" | "<" | ">=" | ">" {% id %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

formatValue -> (
    "standard"i | "future"i | "historic"i | "pioneer"i | "modern"i | "legacy"i | "paupercommander"i |
    "pauper"i |"vintage"i | "penny"i | "commander"i | "brawl"i | "duel"i | "oldschool"i
) {% ([[format]]) => format.toLowerCase() %}

isValue -> (
    "gold"i | "twobrid"i | "hybrid"i | "phyrexian"i | "promo"i | "reprint"i | "firstprint"i | "firstprinting"i | "digital"i
  | "dfc"i | "mdfc"i |"tdfc"i | "extra"i
  | "meld"i | "transform"i | "split"i | "flip"i | "leveler"i | "commander"i | "spell"i | "permanent"i | "historic"i
  | "vanilla"i | "modal"i | "fullart"i | "foil"i | "nonfoil"i | "etched"i | "token"i
  | "bikeland"i | "cycleland"i | "bicycleland"i | "bounceland"i | "karoo"i | "canopyland"i | "canland"i | "fetchland"i
  | "checkland"i | "dual"i | "fastland"i | "filterland"i | "gainland"i | "painland"i | "scryland"i | "shadowland"i | "snarl"i
  | "slowland"i | "shockland"i | "storageland"i | "creatureland"i | "manland"i
  | "triland"i | "triome"i | "trikeland"i | "tricycleland"i
  | "tangoland"i | "battleland"i
  # pulled these from advanced tab in scryfall
  | "adventure"i | "arenaid"i | "artseries"i | "artist"i | "artistmisprint"i | "belzenlok"i
  | "lights"i | "augmentation"i | "back"i | "bear"i | "booster"i | "brawlcommander"i | "buyabox"i
  | "cardmarket"i | "class"i | "ci"i | "colorshifted"i | "companion"i | "contentwarning"i
  | "covered"i | "datestamped"i | "doublesided"i | "duelcommander"i | "etb"i
  | "englishart"i | "etch"i | "extended"i | "flavorname"i | "flavor"i
  | "fbb"i | "fwb"i | "frenchvanilla"i | "funny"i | "future"i | "gameday"i
  | "halo"i | "hires"i | "splitmana"i | "illustration"i | "intropack"i | "invitational"i
  | "localizedname"i | "mtgoid"i | "masterpiece"i
  | "modern"i | "multiverse"i | "new"i | "oathbreaker"i | "old"i | "oversized"i | "paperart"i
  | "party"i | "phyrexia"i | "planar"i | "planeswalkerdeck"i | "prerelease"i | "printedtext"i
  | "related"i | "release"i | "reserved"i | "reversible"i | "stamp"i | "showcase"i
  | "spellbook"i | "spikey"i | "stamped"i | "starterdeck"i | "story"i | "tcgplayer"i | "textless"i
  | "tombstone"i | "onlyprint"i | "variation"i | "watermark"i
) {% ([[category]]) => category.toLowerCase() %}

# anything that isn't a special character and isn't "and" or "or"
noQuoteStringValue ->
  ("a"i | "an"i | "o"i) {% ([[value]]) => value.toLowerCase() %}
  | ([^aAoO\- \t\n"'\\\/=<>:!\+@]
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

comb5[A, B, C, D, E] -> null {% () => [] %}
  | ( $A comb4[$B, $C, $D, $E]
    | $B comb4[$A, $C, $D, $E]
    | $C comb4[$A, $B, $D, $E]
    | $D comb4[$A, $B, $C, $E]
    | $E comb4[$A, $B, $C, $D]
    ) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

comb5NonEmpty[A, B, C, D, E] -> (
    $A comb4[$B, $C, $D, $E]
  | $B comb4[$A, $C, $D, $E]
  | $C comb4[$A, $B, $D, $E]
  | $D comb4[$A, $B, $C, $E]
  | $E comb4[$A, $B, $C, $D]
) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

comb6NonEmpty[A, B, C, D, E, F] -> (
    $A comb5[$B, $C, $D, $E, $F]
  | $B comb5[$A, $C, $D, $E, $F]
  | $C comb5[$A, $B, $D, $E, $F]
  | $D comb5[$A, $B, $C, $E, $F]
  | $E comb5[$A, $B, $C, $D, $F]
  | $F comb5[$A, $B, $C, $D, $E]
) {% ([[[a], rest]]) => [a, ...rest.map(([c]) => c)] %}

colorCombinationKeyword ->
    "white"i {% () => ['w'] %}
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

colorCombinationValue ->
    ("c"i | "brown"i | "colorless"i) {% () => [] %}
  | colorCombinationKeyword {% id %}
  | comb5NonEmpty["w"i, "u"i, "b"i, "r"i, "g"i] {% ([comb]) => comb.map((c) => c.toLowerCase()) %}

producesCombinationValue ->
    ("c"i | "brown"i | "colorless"i) {% () => ['c'] %}
  | colorCombinationKeyword {% id %}
  | comb6NonEmpty["w"i, "u"i, "b"i, "r"i, "g"i, "c"i] {% ([comb]) => comb.map((c) => c.toLowerCase()) %}

manaCostValue -> manaSymbol:+ {% id %}

manaSymbol -> innerManaSymbol {% id %}
  | "{" innerManaSymbol "}" {% ([, inner]) => inner %}

innerManaSymbol -> [0-9]:+ {% ([digits]) => digits.join('') %}
  | ("x"i | "y"i | "z"i | "w"i | "u"i | "b"i | "r"i | "g"i | "s"i | "c"i) {% ([[color]]) => color.toLowerCase() %}
  | ( "2"i "/" ("w"i | "u"i | "b"i | "r"i | "g"i)
    | "p"i "/" ("w"i | "u"i | "b"i | "r"i | "g"i)
    | "w"i "/" ("2"i | "p"i | "u"i | "b"i | "r"i | "g"i)
    | "u"i "/" ("2"i | "p"i | "w"i | "b"i | "r"i | "g"i)
    | "b"i "/" ("2"i | "p"i | "w"i | "u"i | "r"i | "g"i)
    | "r"i "/" ("2"i | "p"i | "w"i | "u"i | "b"i | "g"i)
    | "g"i "/" ("2"i | "p"i | "w"i | "u"i | "b"i | "r"i)
    ) {% ([[color, , [secondColor]]]) => color + "/" + secondColor %}

# todo finish
devotionValue -> "w"i:+ | "u"i:+ | "b"i:+ | "r"i:+ | "g"i:+ {% id %}
  | "w"i:+ | "u"i:+ | "b"i:+ | "r"i:+ | "g"i:+


rarityValue ->
    ("b"i | "bonus"i) {% () => "bonus" %} |
    ("m"i | "mythic"i) {% () => "mythic" %} |
    ("s"i | "special"i) {% () => "special" %} |
    ("r"i | "rare"i) {% () => "rare" %} |
    ("u"i | "uncommon"i) {% () => "uncommon" %} |
    ("c"i | "common"i) {% () => "common" %}

orderValue -> ("artist"i | "cmc"i | "power"i | "toughness"i | "set"i | "name"i | "usd"i | "tix"i | "eur"i | "rarity"i | "color"i | "released"i | "spoiled"i | "edhrec"i | "penny"i | "review"i)
    {% id %}