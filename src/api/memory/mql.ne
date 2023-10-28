@preproccesor typescript
@builtin "whitespace.ne"
@builtin "string.ne"

@{%
const { FilterType } = require('./types/filterKeyword')
%}

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
      (null | "and"i __) {% () => "and" %}
    | "or"i __           {% () => "or" %}

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
    oracleTagCondition
) {% ([[condition]]) => condition %}

cmcCondition ->
    ("manavalue"i | "mv"i | "cmc"i) anyOperator integerValue
        {% ([_, [operator], value]) => ({ filter: FilterType.CmcInt, operator, value }) %} |
    ("manavalue"i | "mv"i | "cmc"i) onlyEqualOperator ("even"i | "odd"i)
        {% ([_, _op, [value]]) => ({ filter: FilterType.CmcOddEven, value }) %}

exactNameCondition -> "!":? stringValue
    {% ([op, value]) => ({ filter: op === "!" ? FilterType.NameExact : FilterType.Name, value }) %}

nameCondition -> ("name"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Name, value }) %}

nameRegexCondition -> ("name"i) onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.NameRegex, value }) %}

colorCondition ->
    ("c"i | "color"i) anyOperator colorCombinationValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ColorSet, operator, value }) %} |
    ("c"i | "color"i) anyOperator integerValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ColorInt, operator, value }) %}

colorIdentityCondition ->
    ("ci"i | "commander"i | "identity"i | "id"i) anyOperator colorCombinationValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ColorIdentitySet, operator, value }) %} |
    ("ci"i | "commander"i | "identity"i | "id"i) anyOperator integerValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ColorIdentityInt, operator, value }) %}

manaCostCondition -> ("mana"i | "m"i) anyOperator manaCostValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Mana, operator, value }) %}

oracleCondition -> ("oracle"i | "o"i | "text"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Oracle, value }) %}

oracleRegexCondition -> ("oracle"i | "o"i | "text"i) onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.OracleRegex, value }) %}

fullOracleCondition -> ("fo"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.FullOracle, value }) %}

fullOracleRegexCondition -> ("fo"i) onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.FullOracleRegex, value }) %}

keywordCondition -> ("kw"i | "keyword"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Keyword, value }) %}

typeCondition -> ("t"i | "type"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Type, value }) %}

typeRegexCondition -> ("t"i | "type"i) onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.TypeRegex, value }) %}

powerCondition -> ("pow"i | "power"i) anyOperator (integerValue | "tou"i | "toughness"i)
    {% ([_, [operator], [value]]) => ({ filter: FilterType.Power, operator, value }) %}

toughCondition -> ("tou"i | "toughness"i) anyOperator (integerValue | "pow"i | "power"i)
    {% ([_, [operator], [value]]) => ({ filter: FilterType.Tough, operator, value }) %}

powTouCondition -> ("pt"i | "powtou"i) anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.PowTou, operator, value }) %}

loyaltyCondition -> ("loy"i | "loyalty"i) anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Loyalty, operator, value }) %}

layoutCondition -> ("layout"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Layout, value }) %}

formatCondition -> ("format"i | "f"i) onlyEqualOperator formatValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Format, value }) %}

bannedCondition -> "banned"i equalityOperator formatValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Banned, value }) %}

restrictedCondition -> "restricted"i equalityOperator formatValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Restricted, value }) %}

isCondition -> ("is"i | "has"i) onlyEqualOperator isValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Is, value }) %}

notCondition -> "not"i onlyEqualOperator isValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Not, value }) %}

printCountCondition -> "prints" anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Prints, operator, value }) %}

inCondition -> "in"i onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.In, value }) %}

producesCondition ->
    "produces"i anyOperator producesCombinationValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ProducesSet, operator, value }) %} |
    "produces"i anyOperator integerValue
        {% ([_, [operator], value]) => ({ filter: FilterType.ProducesInt, operator, value }) %}

devotionCondition -> "devotion"i anyOperator devotionValue
    {% ([_, [operator], [value]]) => ({ filter: FilterType.Devotion, operator, value }) %}

uniqueCondition -> "unique"i onlyEqualOperator ("cards"i | "prints"i | "art"i)
    {% ([_, [_op], value]) => ({ filter: FilterType.Unique, value }) %} |
    "++" {% (_) => ({ filter: FilterType.Unique, value: "prints" }) %} |
    "@@" {% (_) => ({ filter: FilterType.Unique, value: "art" }) %}

orderCondition -> "order"i onlyEqualOperator orderValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Order, value }) %}

directionCondition -> "direction"i onlyEqualOperator ("asc"i | "desc"i)
    {% ([_, [_op], value]) => ({ filter: FilterType.Direction, value }) %}

# print-matters
rarityCondition -> ("r"i | "rarity"i) anyOperator rarityValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Rarity, operator, value }) %}

setCondition -> ("s"i | "set"i| "e"i | "edition"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Set, value }) %}

setTypeCondition -> "st"i onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.SetType, value }) %}

artistCondition -> ("a"i | "artist"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Artist, value }) %}

collectorNumberCondition -> ("cn"i | "number"i) anyOperator integerValue
    {% ([_, [operator], value]) => ({ filter: FilterType.CollectorNumber, operator, value }) %}

borderCondition -> "border"i onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Border, value }) %}

dateCondition -> ("date"i | "year"i) anyOperator stringValue
    {% ([_, [operator], value]) => ({ filter: FilterType.Date, operator, value }) %}

priceCondition -> ("usd"i | "eur"i | "tix"i) anyOperator numberValue
    {% ([[unit], [operator], value]) => ({ filter: FilterType.Price, unit, operator, value }) %}

frameCondition -> "frame"i onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Frame, value }) %}

flavorCondition -> ("flavor"i | "ft"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Flavor, value }) %}

flavorRegexCondition -> ("flavor"i | "ft"i) onlyEqualOperator regexString
    {% ([_, [_op], value]) => ({ filter: FilterType.FlavorRegex, value }) %}

gameCondition -> "game"i onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Game, value }) %}

languageCondition -> ("lang"i | "language"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Language, value }) %}

stampCondition -> "stamp"i onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Stamp, value }) %}

watermarkCondition -> ("wm"i | "watermark"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Watermark, value }) %}

cubeCondition -> ("cube"i | "ctag"i | "tag"i) onlyEqualOperator cubeValue
    {% ([_, [_op], value]) => ({ filter: FilterType.Cube, value }) %}

oracleTagCondition -> ("function"i | "oracletag"i | "otag"i) onlyEqualOperator stringValue
    {% ([_, [_op], value]) => ({ filter: FilterType.OracleTag, value }) %}

# Values
stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value.toLowerCase() %}

cubeValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value %}

regexString -> "/" ([^/] {% id %} | "\/" {% id %}):* "/"  {% function(d) {return d[1].join(""); } %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

numberValue -> [0-9]:* ("." [0-9]:+):?
    {% ([preDec, dec]) => parseFloat(`${preDec.flat().join('')}${dec?.flat().join('')}`) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<=" | "<" | ">=" | ">" {% id %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

onlyEqualOperator -> ":" | "=" {% id %}

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
  | "tangoland"i | "battleland"i | "bondland"i
  # pulled these from advanced tab in scryfall
  | "adventure"i | "arenaid"i | "artseries"i | "artist"i | "artistmisprint"i | "belzenlok"i
  | "lights"i | "augmentation"i | "back"i | "bear"i | "booster"i | "brawlcommander"i | "buyabox"i
  | "cardmarket"i | "class"i | "ci"i | "colorshifted"i | "companion"i | "contentwarning"i
  | "covered"i | "datestamped"i | "doublesided"i | "duelcommander"i | "etb"i
  | "englishart"i | "etch"i | "extended"i | "flavorname"i | "flavor"i
  | "fbb"i | "fwb"i | "frenchvanilla"i | "funny"i | "future"i | "gameday"i
  | "halo"i | "hires"i | "splitmana"i | "illustration"i | "intropack"i | "invitational"i | "setextension"i
  | "localizedname"i | "mtgoid"i | "masterpiece"i
  | "modern"i | "multiverse"i | "new"i | "oathbreaker"i | "old"i | "oversized"i | "paperart"i
  | "party"i | "phyrexia"i | "planar"i | "planeswalkerdeck"i | "prerelease"i | "printedtext"i
  | "related"i | "release"i | "reserved"i | "reversible"i | "stamp"i | "showcase"i | "serialized"i
  | "spellbook"i | "spikey"i | "stamped"i | "starterdeck"i | "story"i | "tcgplayer"i | "textless"i
  | "tombstone"i | "onlyprint"i | "variation"i | "watermark"i | "ub"i | "unique"i | "placeholderimage"i
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
    ) [^ \t\n"'\\=<>:]:* {% ([startChars, chars]) => startChars.concat(chars).join('') %}

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