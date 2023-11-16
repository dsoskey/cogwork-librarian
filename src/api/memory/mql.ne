@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { FilterType } = require('./types/filterKeyword')

const { lexer } = require('./lexer')
%}

@lexer lexer

main -> filterStart {% id %}

filterStart -> _ filter _ {% ([, filter]) => {
    return filter
} %}

filter ->
      filter __ boolOperator clause {% ([left, _, operator, right]) => ({ operator, left, right }) %}
    | clause {% id %}

clause -> "-":? (
      "(" filter ")" {% ([_, f]) => [f] %}
    | condition
) {% ([negation, [clause]]) => {
    if (negation) {
        return { operator: "negate", clause }
    }
    return clause
} %}

boolOperator ->
      (null | "and" __) {% () => "and" %}
    | "or" __           {% () => "or" %}

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
    powTouCondition |
    loyaltyCondition |
    defenseCondition |
    layoutCondition |
    formatCondition |
    bannedCondition |
    restrictedCondition |
    isCondition |
    notCondition |
    printCountCondition |
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
    devotionCondition |
    oracleTagCondition |
    artTagCondition |
    exactNameCondition
) {% ([[condition]]) => condition %}

cmcCondition ->
    ("manavalue" | "mv" | "cmc") %operator integerValue
        {% ([[kw], operator, value]) => {
            console.log("woo hoo!")
            console.log(kw)
            return ({ filter: FilterType.CmcInt, operator: operator.value, value, offset: kw.offset })
        } %} |
    ("manavalue" | "mv" | "cmc") onlyEqualOperator ("even" | "odd")
        {% ([[kw], _op, [value]]) => ({ filter: FilterType.CmcOddEven, value: value.value, offset: kw.offset }) %}

exactNameCondition -> "!":? stringValue
    {% ([op, string]) => ({
        filter: op ? FilterType.NameExact : FilterType.Name,
        value: string.value,
        offset: op ? op.offset : string.offset
    }) %}

nameCondition -> "name" onlyEqualOperator stringValue
    {% ([kw, [_op], string]) => ({
    filter: FilterType.Name,
    value: string.value,
    offset: kw.offset
}) %}

nameRegexCondition -> "name" onlyEqualOperator %regex
    {% ([kw, [_op], string]) => {
    return ({ filter: FilterType.NameRegex, value: string.value, offset: kw.offset })
} %}

colorCondition ->
    ("c" | "color") anyOperator colorCombinationValue {% ([[kw], [operator], colors]) => ({
         filter: FilterType.ColorSet,
         operator: operator.value,
         value: colors.value,
         offset: kw.offset
    }) %} |
    ("c" | "color") anyOperator integerValue {% ([[kw], [operator], value]) => ({
        filter: FilterType.ColorInt,
        operator: operator.value,
        value,
        offset: kw.offset
    }) %}

colorIdentityCondition ->
    ("ci" | "commander" | "identity" | "id") anyOperator colorCombinationValue
    {% ([[kw], [op], colors]) => ({
        filter: FilterType.ColorIdentitySet,
        operator: op.value,
        value:colors.value,
        offset: kw.offset,
    }) %} |
    ("ci" | "commander" | "identity" | "id") anyOperator integerValue
    {% ([[kw], [op], value]) => ({
        filter: FilterType.ColorIdentityInt,
        operator: op.value,
        value,
        offset: kw.offset,
    }) %}

manaCostCondition -> ("mana" | "m") %operator manaCostValue
    {% ([[kw], operator, value]) => ({
     filter: FilterType.Mana,
     operator: operator.value,
     value: value.value, offset: kw.offset }) %}

oracleCondition -> ("oracle" | "o" | "text") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Oracle, value }) %}

oracleRegexCondition -> ("oracle" | "o" | "text") onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.OracleRegex, value }) %}

fullOracleCondition -> "fo" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.FullOracle, value }) %}

fullOracleRegexCondition -> "fo" onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.FullOracleRegex, value }) %}

keywordCondition -> ("kw" | "keyword") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Keyword, value }) %}

typeCondition -> ("t" | "type") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Type, value }) %}

typeRegexCondition -> ("t" | "type") onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.TypeRegex, value }) %}

powerCondition -> ("pow" | "power") anyOperator (integerValue | "tou" | "toughness")
    {% ([_, [operator], [value]]) => ({ filter: FilterType.Power, operator, value }) %}

toughCondition -> ("tou" | "toughness") anyOperator (integerValue | "pow" | "power")
    {% ([_, [operator], [value]]) => ({ filter: FilterType.Tough, operator, value }) %}

powTouCondition -> ("pt" | "powtou") anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.PowTou, operator, value }) %}

loyaltyCondition -> ("loy" | "loyalty") anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Loyalty, operator, value }) %}

defenseCondition -> ("def" | "defense") anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Defense, operator, value }) %}

layoutCondition -> ("layout") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Layout, value }) %}

formatCondition -> ("format" | "f") onlyEqualOperator formatValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Format, value }) %}

bannedCondition -> "banned" equalityOperator formatValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Banned, value }) %}

restrictedCondition -> "restricted" equalityOperator formatValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Restricted, value }) %}

isCondition -> ("is" | "has") onlyEqualOperator isValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Is, value }) %}

notCondition -> "not" onlyEqualOperator isValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Not, value }) %}

printCountCondition -> "prints" anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Prints, operator, value }) %}

inCondition -> "in" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.In, value }) %}

producesCondition ->
    "produces" anyOperator producesCombinationValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ProducesSet, operator, value }) %} |
    "produces" anyOperator integerValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ProducesInt, operator, value }) %}

devotionCondition -> "devotion" anyOperator devotionValue
    {% ([_, [operator], [value]]) => ({ filter: FilterType.Devotion, operator, value }) %}

uniqueCondition -> "unique" onlyEqualOperator ("cards" | "prints" | "art")
    {% ([_, [_op], value]) => ({ filter: FilterType.Unique, value }) %} |
    "++" {% (_) => ({ filter: FilterType.Unique, value: "prints" }) %} |
    "@@" {% (_) => ({ filter: FilterType.Unique, value: "art" }) %}

orderCondition -> "order" onlyEqualOperator orderValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Order, value }) %}

directionCondition -> "direction" onlyEqualOperator ("asc" | "desc")
    {% ([_, [_op], value]) => ({ filter: FilterType.Direction, value }) %}

# print-matters
rarityCondition -> ("r" | "rarity") anyOperator rarityValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Rarity, operator, value }) %}

setCondition -> ("s" | "set"| "e" | "edition") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Set, value }) %}

setTypeCondition -> "st" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.SetType, value }) %}

artistCondition -> ("a" | "artist") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Artist, value }) %}

collectorNumberCondition -> ("cn" | "number") anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.CollectorNumber, operator, value }) %}

borderCondition -> "border" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Border, value }) %}

dateCondition -> ("date" | "year") anyOperator stringValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Date, operator, value }) %}

priceCondition -> ("usd" | "eur" | "tix") anyOperator numberValue
    {% ([[unit], [operator], value]) => ({ filter: FilterType.Price, unit, operator, value }) %}

frameCondition -> "frame" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Frame, value }) %}

flavorCondition -> ("flavor" | "ft") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Flavor, value }) %}

flavorRegexCondition -> ("flavor" | "ft") onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.FlavorRegex, value }) %}

gameCondition -> "game" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Game, value }) %}

languageCondition -> ("lang" | "language") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Language, value }) %}

stampCondition -> "stamp" onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Stamp, value }) %}

watermarkCondition -> ("wm" | "watermark") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Watermark, value }) %}

# Known issue: stringValue lowercases but cube keys are stored with original casing
cubeCondition -> ("cube" | "ctag" | "tag") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Cube, value }) %}

oracleTagCondition -> ("function" | "oracletag" | "otag") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.OracleTag, value }) %}

artTagCondition -> ("art" | "arttag" | "atag") onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.IllustrationTag, value }) %}

# Values
stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value %}

cubeValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value %}

regexString -> "/" ([^/] {% id %} | "\/" {% id %}):* "/"  {% function(d) {return d[1].join(""); } %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

numberValue -> [0-9]:* ("." [0-9]:+):?
    {% ([preDec, dec]) => parseFloat(`${preDec.flat().join('')}${dec?.flat().join('')}`) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<=" | "<" | ">=" | ">" {% id %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

onlyEqualOperator -> ":" | "=" {% id %}

formatValue -> (
    "standard" | "future" | "historic" | "pioneer" | "modern" | "legacy" | "paupercommander" |
    "pauper" |"vintage" | "penny" | "commander" | "brawl" | "duel" | "oldschool"
) {% ([[format]]) => format %}

isValue -> (
    "gold" | "twobrid" | "hybrid" | "phyrexian" | "promo" | "reprint" | "firstprint" | "firstprinting" | "digital"
  | "dfc" | "mdfc" |"tdfc" | "extra"
  | "meld" | "transform" | "split" | "flip" | "leveler" | "commander" | "spell" | "permanent" | "historic"
  | "vanilla" | "modal" | "fullart" | "foil" | "nonfoil" | "etched" | "token"
  | "bikeland" | "cycleland" | "bicycleland" | "bounceland" | "karoo" | "canopyland" | "canland" | "fetchland"
  | "checkland" | "dual" | "fastland" | "filterland" | "gainland" | "painland" | "scryland" | "shadowland" | "snarl"
  | "slowland" | "shockland" | "storageland" | "creatureland" | "manland"
  | "triland" | "triome" | "trikeland" | "tricycleland"
  | "tangoland" | "battleland" | "bondland"
  # pulled these from advanced tab in scryfall
  | "adventure" | "arenaid" | "artseries" | "artist" | "artistmisprint" | "belzenlok"
  | "lights" | "augmentation" | "back" | "bear" | "booster" | "brawlcommander" | "buyabox"
  | "cardmarket" | "class" | "ci" | "colorshifted" | "companion" | "contentwarning"
  | "covered" | "datestamped" | "doublesided" | "duelcommander" | "etb"
  | "englishart" | "etch" | "extended" | "flavorname" | "flavor"
  | "fbb" | "fwb" | "frenchvanilla" | "funny" | "future" | "gameday"
  | "halo" | "hires" | "splitmana" | "llustration" | "ntropack" | "nvitational" | "setextension"
  | "localizedname" | "mtgoid" | "masterpiece"
  | "modern" | "multiverse" | "new" | "oathbreaker" | "old" | "oversized" | "paperart"
  | "party" | "phyrexia" | "planar" | "planeswalkerdeck" | "prerelease" | "printedtext"
  | "related" | "release" | "reserved" | "reversible" | "stamp" | "showcase" | "serialized"
  | "spellbook" | "spikey" | "stamped" | "starterdeck" | "story" | "tcgplayer" | "textless"
  | "tombstone" | "onlyprint" | "variation" | "watermark" | "ub" | "unique" | "placeholderimage"
) {% ([[category]]) => category %}

noQuoteStringValue ->
  ("a" | "an" | "o") {% ([[value]]) => value %}
  | ([^aAoO\- \t\n"'\\\/=<>:!\+@]
    | "a" [^nN \t\n"'\\=<>:]
    | "an" [^dD \t\n"'\\=<>:]
    | "and" [^ \t\n"'\\=<>:]
    | "o" [^rR \t\n"'\\=<>:]
    | "or" [^ \t\n"'\\=<>:]
    ) [^ \t\n"'\\=<>:]:* {% ([startChars, chars], _, reject) => {
    // hack: The lexer causes "or" to get picked up as a name search
    if (startChars[0]?.type === "bool" || startChars[0]?.type === "regex") {
        return reject;
    }
    return { value: startChars.concat(chars).join(''), offset: startChars[0]?.offset ?? -1 }
} %}


# https://github.com/dekkerglen/CubeCobra/blob/dfbe1bdea3020cf4c619d6c6b360efe8e78f100f/nearley/values.ne#L85
comb1[A] -> null {% () => [] %}
  | $A {% ([comb]) => {
  console.log(comb)
  return comb} %}

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
    "white" {% () => ['w'] %}
  | "blue" {% () => ['u'] %}
  | "black" {% () => ['b'] %}
  | "red" {% () => ['r'] %}
  | "green" {% () => ['g'] %}
  | ("azorius")  {% () => ['w', 'u'] %}
  | ("dimir")  {% () => ['u', 'b'] %}
  | ("rakdos")  {% () => ['b', 'r'] %}
  | ("gruul")  {% () => ['r', 'g'] %}
  | ("selesnya")  {% () => ['g', 'w'] %}
  | ("silverquill" | "orzhov")  {% () => ['w', 'b'] %}
  | ("prismari" | "izzet")  {% () => ['u', 'r'] %}
  | ("witherbloom" | "golgari")  {% () => ['b', 'g'] %}
  | ("lorehold" | "boros")  {% () => ['w', 'r'] %}
  | ("quandrix" | "simic")  {% () => ['u', 'g'] %}
  | ("brokers" | "bant")  {% () => ['w', 'u', 'g'] %}
  | ("obscura" | "esper")  {% () => ['w', 'u', 'b'] %}
  | ("maestros" | "grixis")  {% () => ['u', 'b', 'r'] %}
  | ("riveteers" | "jund")  {% () => ['b', 'r', 'g'] %}
  | ("cabaretti" | "naya")  {% () => ['w', 'r', 'g'] %}
  | ("savai" | "dega" | "mardu")  {% () => ['w', 'b', 'r'] %}
  | ("ketria" | "ceta" | "temur")  {% () => ['u', 'r', 'g'] %}
  | ("indatha" | "necra" | "abzan")  {% () => ['w', 'b', 'g'] %}
  | ("raugrin" | "raka" | "jeskai")  {% () => ['w', 'u', 'r'] %}
  | ("zagoth" | "ana" | "sultai")  {% () => ['u', 'b', 'g'] %}
  | "chaos" {% () => ['b','g','r','u'] %}
  | "aggression" {% () => ['b','g','r','w'] %}
  | "altruism" {% () => ['w','g','r','u'] %}
  | "growth" {% () => ['b','g','w','u'] %}
  | "artifice" {% () => ['b','w','r','u'] %}
  | ("rainbow" | "fivecolor")  {% () => ['w', 'u', 'b', 'r', 'g'] %}

colorCombinationValue ->
    ("c" | "brown" | "colorless")  {% () => [] %}
  | colorCombinationKeyword {% id %}
  | noQuoteStringValue {% ([token], _, reject) => {
    console.log(token)
    if (/[^wubrgc]/.test(token.value)) {
        return reject
    }
    return { value: token.value.split(""), offset: token.offset }
  } %}

producesCombinationValue ->
    ("c" | "brown" | "colorless")  {% () => ['c'] %}
  | colorCombinationKeyword {% id %}
  | comb6NonEmpty["w", "u", "b", "r", "g", "c"] {% ([comb]) => comb.map((c) => c.toLowerCase()) %}

manaCostValue -> manaSymbol:+ {% id %}
  | noQuoteStringValue {% ([token], _, reject) => {
    console.log(token)
    if (/[^0-9xyzwubrgsc]/.test(token.value)) {
        return reject
    }
    return { value: token.value.split(""), offset: token.offset }
  } %}


manaSymbol -> "{" innerManaSymbol "}" {% ([, inner]) => inner %}

innerManaSymbol -> [0-9]:+ {% ([digits]) => digits.join('') %}
  | ("x" | "y" | "z" | "w" | "u" | "b" | "r" | "g" | "s" | "c")  {% ([[color]]) => color.value %}
  | ( "2" "/" ("w" | "u" | "b" | "r" | "g") 
    | "p" "/" ("w" | "u" | "b" | "r" | "g") 
    | "w" "/" ("2" | "p" | "u" | "b" | "r" | "g") 
    | "u" "/" ("2" | "p" | "w" | "b" | "r" | "g") 
    | "b" "/" ("2" | "p" | "w" | "u" | "r" | "g") 
    | "r" "/" ("2" | "p" | "w" | "u" | "b" | "g") 
    | "g" "/" ("2" | "p" | "w" | "u" | "b" | "r") 
    ) {% ([[color, , [secondColor]]]) => color + "/" + secondColor %}

# todo finish
devotionValue -> "w":+ | "u":+ | "b":+ | "r":+ | "g":+ {% id %}
  | "w":+ | "u":+ | "b":+ | "r":+ | "g":+


rarityValue ->
    ("b" | "bonus")  {% () => "bonus" %} |
    ("m" | "mythic")  {% () => "mythic" %} |
    ("s" | "special")  {% () => "special" %} |
    ("r" | "rare")  {% () => "rare" %} |
    ("u" | "uncommon")  {% () => "uncommon" %} |
    ("c" | "common")  {% () => "common" %}

orderValue -> ("artist" | "cmc" | "power" | "toughness" | "set" | "name" | "usd" | "tix" | "eur" | "rarity" | "color" | "released" | "spoiled" | "edhrec" | "penny" | "review") 
    {% id %}