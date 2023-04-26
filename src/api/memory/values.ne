
# Values
stringValue -> (noQuoteStringValue | dqstring | sqstring) {% ([[value]]) => value.toLowerCase() %}

regexString -> "/" [^/]:* "/"  {% function(d) {return d[1].join(""); } %}

integerValue -> [0-9]:+ {% ([digits]) => parseInt(digits.join(''), 10) %}

numberValue -> [0-9]:* ("." [0-9]:+):?
    {% ([preDec, dec]) => parseFloat(`${preDec.flat().join('')}${dec?.flat().join('')}`) %}

anyOperator -> ":" | "=" | "!=" | "<>" | "<=" | "<" | ">=" | ">" {% id %}

equalityOperator -> ":" | "=" | "!=" | "<>" {% id %}

formatValue -> (
    "standard"i | "future"i | "historic"i | "pioneer"i | "modern"i | "legacy"i |
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

rarityValue ->
    ("b"i | "bonus"i) {% () => "bonus" %} |
    ("m"i | "mythic"i) {% () => "mythic" %} |
    ("s"i | "special"i) {% () => "special" %} |
    ("r"i | "rare"i) {% () => "rare" %} |
    ("u"i | "uncommon"i) {% () => "uncommon" %} |
    ("c"i | "common"i) {% () => "common" %}