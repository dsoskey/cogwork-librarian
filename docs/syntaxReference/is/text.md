### is

The `is` filter is a collection of premade queries that are supported by Scryfall.
Some filters read better with the alias `has`, which is equivalent to `is`.
Similarly, `not` is equivalent to `-is`.
See the tables below for the full list of supported and documented `is` filters.

| Filter name      | Description                                                                                                          | Support* |
|------------------|----------------------------------------------------------------------------------------------------------------------|----------|
| adventure        | cards that go on an adventure                                                                                        | ⚙️       |
| arenaid          | cards with an arena_id                                                                                               | ⚙️       |
| artist           | cards with at least one artist                                                                                       | ⚙️       |
| artistmisprint   | not implemented                                                                                                      | 👁       |
| artseries        | card is an art series card                                                                                           | ⚙️       |
| augmentation     | cards with augment or host                                                                                           | ⚙️       |
| back             | cards with non-default back                                                                                          | ⚙️       |
| battleland       | bfz typed dual lands. see `tangoland`                                                                                | ⚙️       |
| bear             | cards that are 2 mana 2/2s                                                                                           | ⚙️       |
| belzenlok        | not implemented                                                                                                      | 👁       |
| bicycleland      | akh cycling dual lands. see `bikeland`                                                                               | ⚙️       |
| bikeland         | akh cycling dual lands. see `cycleland`                                                                              | ⚙️       |
| bondland         | multiplayer untapped dual lands from battlebond                                                                      | ⚙️       |
| booster          | draftable cards found in boosters                                                                                    | ⚙️       |
| bounceland       | lands that return other lands when they enter. see `karoo`                                                           | ⚙️       |
| brawlcommander   | cards that can be your brawl commander                                                                               | ⚙️       |
| buyabox          | buy a box promos                                                                                                     | ⚙️       |
| canland          | untapped dual lands that sacrifice to draw a card. see `canopyland`                                                  | ⚙️       |
| canopyland       | untapped dual lands that sacrifice to draw a card. see `canopyland`                                                  | ⚙️       |
| cardmarket       | cards with a cardmarket id                                                                                           | ⚙️       |
| checkland        | dual lands that check for their land types on enter.                                                                 | ⚙️       |
| ci               | cards with a color indicator                                                                                         | ⚙️       |
| class            | cards with the class type                                                                                            | ⚙️       |
| colorshifted     | cards printed in another color in Planar Chaos                                                                       | ⚙️       |
| commander        | cards that can be your commander                                                                                     | ⚙️       |
| companion        | cards that can be your companion                                                                                     | ⚙️       |
| contentwarning   | cards with text or art deemed offensive by WOTCAHS and Scryfall. Consider using other cards for all contexts.        | ⚙️       |
| core             | cards printed in a core set                                                                                          | ⚙️       |
| covered          | not implemented                                                                                                      | 👁️      |
| creatureland     | lands that turn themselves into creatures. see `manland`                                                             | ⚙️       |
| cycleland        | akh cycling dual lands. see `bicycleland`                                                                            | ⚙️       |
| datestamped      | cards with a commemorative date stamped on them                                                                      | ⚙️       |
| dfc              | double-faced cards                                                                                                   | ⚙️       |
| digital          | cards available digitally                                                                                            | ⚙️       |
| doublesided      | cards with 2 sides                                                                                                   | ⚙️       |
| dual             | lands that tap for 2 colors of mana                                                                                  | ⚙️       |
| duelcommander    | cards that can be your Duel Commander                                                                                | ⚙️       |
| englishart       | not implemented                                                                                                      | 👁️      |
| etb              | cards with an enter the battlefield ability                                                                          | ⚙️       |
| etch             | etched foil cards. see `etched`                                                                                      | 👁️      |
| etched           | etched foil cards. see `etch`                                                                                        | ⚙️       |
| expansion        | cards printed in a booster expansion set                                                                             | ⚙️       |
| extended         | cards with extended art                                                                                              | ⚙️       |
| extra            | cards that are extras, not used for tournament play and rarely used in casual play. includes tokens, booster insets, | ⚙️       |
| fastland         | duals that enter untapped if you control 2 or fewer other lands                                                      | ⚙️       |
| fbb              | white bordered cards printed in foreign black border as that languages first printing                                | ⚙️       |
| fetchland        | Onslaught and Zendikar fetch lands                                                                                   | ⚙️       |
| filterland       | Shadowmoor/Eventide filter dual lands.                                                                               | ⚙️       |
| firstprint       | cards that are the original printing. see `firstprinting`                                                            | ⚙️       |
| firstprinting    | cards that are the original printing. see `firstprint`                                                               | ⚙️       |
| flavor           | cards with flavor text                                                                                               | ⚙️       |
| flavorname       | cards with a flavor name different from oracle name, for example: Mothra, Supersonic Queen                           | ⚙️       |
| flip             | Kamigawa block style flip cards                                                                                      | ⚙️       |
| foil             | cards that come in foil                                                                                              | ⚙️       |
| frenchvanilla    | not implemented                                                                                                      | 👁️      |
| fullart          | cards with full art treatment                                                                                        | ⚙️       |
| funny            | silver border and other joke cards                                                                                   | ⚙️       |
| future           | cards with the Future Sight futureshifted frame                                                                      | ⚙️       |
| fwb              | foreign white border                                                                                                 | ⚙️       |
| gainland         | duals that gain you life when they enter.                                                                            | ⚙️       |
| gameday          | Game Day promos                                                                                                      | ⚙️       |
| gold             | cards with 2+ colors                                                                                                 | ⚙️       |
| halo             | cards printed with halo foil treatement                                                                              | ⚙️       |
| hires            | Scryfall has a high resolution image of these cards                                                                  | ⚙️       |
| historic         | Artifacts, Legendaries, and Sagas                                                                                    | ⚙️       |
| hybrid           | card uses hybrid mana. see `splitmana`                                                                               | ⚙️       |
| illustration     | cards with an illustration                                                                                           | ⚙️       |
| intropack        | cards only printed in an intro pack                                                                                  | ⚙️       |
| invitational     | cards designed by winners of invitational tournaments                                                                | 👁️      |
| karoo            | lands that return other lands when they enter. see `bounceland`                                                      | ⚙️       |
| leveler          | cards with the level up mechanic                                                                                     | ⚙️       |
| lights           | cards with attraction lights                                                                                         | ⚙️       |
| localizedname    | cards with a printed name different from oracle name. This often means non-English.                                  | ⚙️       |
| manland          | lands that turn themselves into creatures. see `creatureland`                                                        | ⚙️       |
| masterpiece      | cards included in masterpiece subsets                                                                                | ⚙️       |
| mdfc             | modal double-faced cards                                                                                             | ⚙️       |
| meld             | cards with the meld mechanic                                                                                         | ⚙️       |
| modal            | cards that let you choose                                                                                            | ⚙️       |
| modern           | cards with the 2003-2014 frame                                                                                       | ⚙️       |
| mtgoid           | cards with an MTGO id                                                                                                | ⚙️       |
| multiverse       | cards with a Multiverse id                                                                                           | ⚙️       |
| new              | cards with a default 2003-now frame                                                                                  | ⚙️       |
| nonfoil          | cards that have a nonfoil printing                                                                                   | ⚙️       |
| oathbreaker      | cards that can be your oathbreaker                                                                                   | ⚙️       |
| old              | cards with a pre-2003 frame                                                                                          | ⚙️       |
| onlyprint        | cards that have a single printing                                                                                    | ⚙️       |
| outlaw           | Assassins, Mercenaries, Pirates, Rogues, and Warlocks                                                                | ⚙️       |
| oversized        | oversized promo cards                                                                                                | ⚙️       |
| painland         | dual lands that deal 1 damage when you tap for colored mana                                                          | ⚙️       |
| paperart         | not implemented                                                                                                      | 👁️      |
| party            | Clerics, Rogues, Warriors, or Wizards                                                                                | ⚙️       |
| permanent        | cards that can be on the battlefield. This primarily excludes instant and sorcery                                    | ⚙️       |
| phyrexia         | cards that have phyrexian mana in their mana cost or text box.                                                       | ⚙️       |
| phyrexian        | cards that have phyrexian mana in their mana cost or text box.                                                       | ⚙️       |
| planar           | cards with the Planar type                                                                                           | ⚙️       |
| planeswalkerdeck | cards printed in Planeswalker Decks                                                                                  | ⚙️       |
| prerelease       | prerelease promo cards                                                                                               | ⚙️       |
| printedtext      | Cards with printed text different from oracle text. This often means non-English                                     | ⚙️       |
| promo            | all promotional cards                                                                                                | ⚙️       |
| related          | cards that are mechanically related to another card                                                                  | ⚙️       |
| release          | release promos                                                                                                       | ⚙️       |
| reprint          | cards that have at least 1 reprint                                                                                   | ⚙️       |
| reserved         | cards on the Reserved list :(                                                                                        | ⚙️       |
| reversible       | reversible cards, aka cards with different printings on either side                                                  | ⚙️       |
| scryland         | dual lands that scry when they enter.                                                                                | ⚙️       |
| serialized       | cards with serial numbers                                                                                            | ⚙️       |
| setextension     | boosterfun cards from previous sets.                                                                                 | 👁️      |
| shadowland       | duals that enter untapped if you reveal a matching basic. see `snarl`                                                | ⚙️       |
| shockland        | typed duals that enter untapped if you pay 2 life                                                                    | ⚙️       |
| showcase         | cards with a showcase frame                                                                                          | ⚙️       |
| slowland         | duals that enter untapped if you control 2 other lands                                                               | ⚙️       |
| snarl            | duals that enter untapped if you reveal a matching basic. see `shadowland`                                           | ⚙️       |
| spell            | cards that can be cast. Lands and Tokens are notable exceptions.                                                     | ⚙️       |
| spellbook        | cards that bring in extra cards using a spellbook                                                                    | ⚙️       |
| spikey           | cards that have been banned at any point in time                                                                     | 👁️      |
| split            | cards with the split layout                                                                                          | ⚙️       |
| splitmana        | card uses hybrid mana. see `hybrid`                                                                                  | ⚙️       |
| stamp, stamped   | cards with a security stamp                                                                                          | ⚙️       |
| starterdeck      | cards printed in starter decks                                                                                       | ⚙️       |
| storageland      | lands that store mana with storage counters                                                                          | ⚙️       |
| story            | story spotlight cards                                                                                                | ⚙️       |
| tangoland        | bfz typed dual lands. see `battleland`                                                                               | ⚙️       |
| tcgplayer        | cards with a tcgplayer id                                                                                            | ⚙️       |
| tdfc             | cards that transform like the original Innistrad DFCs                                                                | ⚙️       |
| textless         | cards with no _printed_ rules text                                                                                   | ⚙️       |
| token            | cards that are tokens                                                                                                | ⚙️       |
| tombstone        | cards with a tombstone symbol                                                                                        | ⚙️       |
| transform        | cards that can tranform.                                                                                             | ⚙️       |
| tricycleland     | tri lands with basic land types and cycling. see `trikeland`                                                         | ⚙️       |
| trikeland        | tri lands with basic land types and cycling. see `triome`                                                            | ⚙️       |
| triland          | etb tapped trilands                                                                                                  | ⚙️       |
| triome           | tri lands with basic land types and cycling. see `tricycleland`                                                      | ⚙️       |
| ub               | universes beyond cards                                                                                               | ⚙️       |
| vanilla          | cards with no rules text                                                                                             | ⚙️       |
| variation        | cards with print variations, for example 2/3 Corpse Knight                                                           | ⚙️       |
| watermark        | cards with a watermark                                                                                               | ⚙️       |

* For the ultimate source of truth on Cogwork Libarian's support, see [this file](https://github.com/dsoskey/mtgql-js/blob/028b8f70ea8261c9b0cf002242e99ed62e266e14/src/types/card.ts#L25).