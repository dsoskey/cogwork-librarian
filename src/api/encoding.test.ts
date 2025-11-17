import { describe, expect, test } from 'vitest'
import { b64encode } from '../encoding'
import lodash from 'lodash'

const BIG_LIST = `2 Lorehold Command (pstx) 199s
3 Quintorius Kand (lci) 352
1 Ancient Tomb (tmp) 315
1 Arid Mesa (zen) 211
1 Bazaar of Baghdad (arn) 70
1 Blood Crypt (rtr) 238
1 Bloodstained Mire (ons) 313
1 Boseiju, Who Endures (neo) 266
1 Breeding Pool (gtc) 240
1 Cave of the Frost Dragon (afr) 350
1 City of Traitors (olgc) 2019NA
1 Commercial District (mkm) 259
1 Creeping Tar Pit (wwk) 134
1 Den of the Bugbear (afr) 351
1 Elegant Parlor (mkm) 260
1 Engineered Explosives (5dn) 118
1 Eumidian Hatchery (eoc) 40
1 Field of the Dead (m20) 247
1 Flagstones of Trokair (tsp) 272
1 Flooded Strand (ktk) 233
1 Godless Shrine (gtc) 242
1 Hallowed Fountain (rtr) 241
1 Hangarback Walker (ori) 229
1 Hedge Maze (mkm) 262
1 Hive of the Eye Tyrant (afr) 355
1 Horizon Canopy (fut) 177
1 Lazotep Quarry (m3c) 131
1 Lush Portico (mkm) 263
1 Marsh Flats (zen) 219
1 Meticulous Archive (mkm) 264
1 Mishra's Bauble (brr) 34
1 Mishra's Factory (atq) 80a
1 Misty Rainforest (zen) 220
1 Nurturing Peatland (mh1) 243
1 Overgrown Tomb (rtr) 243
1 Phyrexian Tower (usg) 322
1 Pit of Offerings (lci) 278
1 Polluted Delta (ons) 321
1 Raucous Theater (mkm) 266
1 Restless Anchorage (lci) 280
1 Restless Vents (lci) 351
1 Rustvale Bridge (mh2) 253
1 Sacred Foundry (gtc) 245
1 Scalding Tarn (zen) 223
1 Shadowy Backstreet (mkm) 268
1 Shelldock Isle (lrw) 272
1 Sheltering Landscape (mh3) 227
1 Silent Clearing (mh1) 246
1 Silverbluff Bridge (mh2) 255
1 Slagwoods Bridge (mh2) 256
1 Sokenzan, Crucible of Defiance (neo) 415
1 Steam Vents (rtr) 247
1 Stomping Ground (gtc) 247
1 Stonecoil Serpent (eld) 235
1 Sunbaked Canyon (mh1) 247
1 Talon Gates of Madara (m3c) 134
1 Temple Garden (rtr) 248
1 Thundering Falls (mkm) 269
1 Treetop Village (10e) 361
1 Undercity Sewers (mkm) 270
1 Underground Mortuary (mkm) 333
1 Urza's Bauble (ice) 343
1 Urza's Saga (mh2) 259
1 Verdant Catacombs (zen) 229
1 Walking Ballista (mb2) 238
1 Wasteland (wc99) mlp330
1 Waterlogged Grove (mh1) 249
1 Watery Grave (gtc) 249
1 Windswept Heath (ons) 328
1 Wooded Foothills (ons) 330
1 Aether Spellbomb (jmp) 456
1 Arbor Elf (a25) 160
1 Arcbound Javelineer (mh2) 2
1 Basking Rootwalla (tor) 121
1 Beckon Apparition (eve) 82
1 Birds of Paradise (pm11) 165★
1 Blazing Rootwalla (mh2) 404
1 Bloodsoaked Champion (ktk) 66
1 Bone Shards (mh2) 395
1 Bonesplitter (mrd) 146
1 Booster Tutor (unh) 51
1 Brainstorm (ice) 61
1 Burst Lightning (zen) 119
1 Cabal Therapy (jud) 62
1 Careful Study (ody) 70
1 Carrion Feeder (scg) 59
1 Cenote Scout (lci) 178
1 Chain Lightning (leg) 137
1 Cling to Dust (thb) 87
1 Clockwork Percussionist (dsk) 130
1 Condemn (m11) 11
1 Consider (mb2) 25
1 Cryptbreaker (emn) 86
1 Currency Converter (ncc) 81
1 Deathrite Shaman (rtr) 213
1 Dragon's Rage Channeler (mb2) 56
1 Dread Wanderer (akh) 88
1 Dreams of Steel and Oil (bro) 92
1 Dryad Militant (rtr) 214
1 Elspeth's Smite (mom) 13
1 Elvish Reclaimer (m20) 169
1 Esper Sentinel (mh2) 12
1 Faithless Looting (brc) 116
1 Firebolt (ody) 193
1 Forsaken Miner (otj) 88
1 Gingerbrute (eld) 219
1 Gitaxian Probe (nph) 35
1 Giver of Runes (h1r) 3
1 Goblin Welder (ulg) 80
1 Greasewrench Goblin (dft) 132
1 Green Sun's Zenith (mbs) 81
1 Grim Lavamancer (tor) 100
1 Grist, Voracious Larva // Grist, the Plague Swarm (mh3) 251
1 Hard Evidence (mh2) 46
1 Hedron Crab (zen) 47
1 Helping Hand (lci) 17
1 Ignoble Hierarch (mh2) 414
1 Indebted Spirit (mh3) 31
1 Inquisition of Kozilek (roe) 115
1 Jack-o'-Lantern (mid) 254
1 Joraga Treespeaker (roe) 190
1 Land Tax (ptc) shr34
1 Lightning Axe (2xm) 135
1 Mana Tithe (plc) 25
1 Monastery Swiftspear (tsr) 349
1 Mother of Runes (cmd) 21
1 Noble Hierarch (con) 87
1 Obsessive Search (tor) 43
1 Occult Epiphany (voc) 52
1 Phantasmal Shieldback (j25) 8
1 Pillar of Flame (avr) 149
1 Ponder (tsr) 315
1 Portable Hole (afr) 398
1 Preordain (mb2) 35
1 Prismatic Ending (mh2) 384
1 Pyrite Spellbomb (2xm) 283
1 Rabbit Battery (neo) 157
1 Rolling Earthquake (v14) 10
1 Scrabbling Claws (c18) 218
1 Sensei's Divining Top (chk) 268
1 Skullclamp (dst) 140
1 Snarling Gorehound (mkm) 105
1 Spyglass Siren (lci) 78
1 Stalactite Stalker (lci) 122
1 Stern Scolding (ltr) 71
1 Thought Scour (dka) 52
1 Thoughtseize (tsr) 334
1 Thraben Inspector (prcq) 3
1 Toolcraft Exemplar (kld) 32
1 Traverse the Ulvenwald (soi) 234
1 Turn the Earth (mid) 205
1 Unearth (ulg) 72
1 Unholy Heat (mb2) 63
1 Veteran Survivor (dsk) 40
1 Voldaren Epicure (vow) 308
1 Weathered Wayfarer (2x2) 578
1 Abrade (phou) 83
1 Arcbound Ravager (ppro) 2019
1 Armored Scrapgorger (one) 158
1 Asylum Visitor (soi) 99
1 Badgermole Cub (tla) 167
1 Balance (ema) 2
1 Barbed Spike (mh2) 5
1 Bartolomé del Presidio (lci) 409
1 Bitterblossom (2x2) 69
1 Bitter Triumph (lci) 91
1 Bloodghast (zen) 83
1 Cathar Commando (inr) 336
1 Cemetery Gatekeeper (vow) 148
1 Chart a Course (xln) 48
1 Clarion Spirit (khm) 6
1 Cleansing Wildfire (znr) 137
1 Coldsteel Heart (2x2) 301
1 Collective Brutality (emn) 85
1 Containment Construct (neo) 243
1 Counterspell (a25) 50
1 Cryogen Relic (eoe) 52
1 Dark Confidant (rav) 81
1 Deeproot Wayfinder (mom) 184
1 Dire Fleet Daredevil (rix) 99
1 Dreadhorde Arcanist (tsr) 341
1 Earthshaker Khenra (hou) 90
1 Fateful Absence (mid) 18
1 Fauna Shaman (m11) 172
1 Fear of Missing Out (dsk) 136
1 Fell (blb) 383
1 Fiend Artisan (iko) 220
1 Glyph Elemental (mh3) 27
1 Goblin Bombardment (tmp) 179
1 Goblin Engineer (tsr) 345
1 Heritage Reclamation (tdm) 145
1 Hermit Druid (sth) 108
1 Hidden Stockpile (aer) 129
1 Infernal Grasp (mid) 389
1 Inti, Seneschal of the Sun (lci) 156
1 Ivora, Insatiable Heir (j25) 50
1 Jace, Vryn's Prodigy // Jace, Telepath Unbound (ori) 60
1 Jadar, Ghoulcaller of Nephalia (mid) 108
1 Journey to Nowhere (zen) 14
1 Kari Zev, Skyship Raider (aer) 87
1 Kishla Skimmer (tdm) 201
1 Kroxa, Titan of Death's Hunger (thb) 221
1 Ledger Shredder (psnc) 46p
1 Life from the Loam (ddj) 69
1 Lose Focus (mh2) 49
1 Lotus Cobra (znr) 193
1 Luminarch Aspirant (znr) 24
1 Malcolm, Alluring Scoundrel (lci) 63
1 Malevolent Hermit // Benevolent Geist (mid) 61
1 Malevolent Rumble (mh3) 161
1 Mana Leak (m11) 62
1 Manamorphose (mma) 191
1 Marionette Apprentice (mh3) 410
1 Memory Lapse (sta) 16
1 Mind Stone (wth) 153
1 Miscalculation (ulg) 36
1 Mogg War Marshal (tsr) 176
1 Oswald Fiddlebender (afr) 28
1 Pack Rat (rtr) 73
1 Phantasmal Image (m12) 72
1 Phyrexian Revoker (brr) 40
1 Planar Disruption (one) 28
1 Quag Feast (dft) 452
1 Raffine's Informant (snc) 26
1 Reclusive Taxidermist (vow) 214
1 Remand (tsr) 316
1 Reprieve (ltr) 26
1 Rona, Herald of Invasion // Rona, Tolarian Obliterator (mom) 75
1 Sakura-Tribe Elder (c19) 177
1 Satyr Wayfinder (c16) 165
1 Scrapheap Scrounger (kld) 231
1 Seasoned Hallowblade (m21) 34
1 Selfless Spirit (prcq) 2
1 Smuggler's Copter (kld) 235
1 Snapcaster Mage (isd) 78
1 Splitskin Doll (dsk) 33
1 Springheart Nantuko (mh3) 171
1 Steel Overseer (ddf) 44
1 Stoneforge Mystic (wwk) 20
1 Subterranean Schooner (lci) 80
1 Surge Engine (gdy) 9
1 Survival of the Fittest (exo) 129
1 Syr Ginger, the Meal Ender (pwoe) 252s
1 Talisman of Conviction (mh1) 230
1 Talisman of Creativity (mh1) 231
1 Talisman of Progress (mrd) 256
1 Tarmogoyf (tsr) 235
1 Thassa's Oracle (thb) 73
1 The Meathook Massacre (mid) 112
1 The Raven Man (dmu) 103
1 Third Path Iconoclast (bro) 223
1 Vault Skirge (nph) 76
1 Vraan, Executioner Thane (one) 114
1 Watcher for Tomorrow (mh1) 76
1 Wight of the Reliquary (mh3) 207
1 Winding Way (mh1) 193
1 Wrenn and Six (mh1) 217
1 Alesha, Who Smiles at Death (c20) 143
1 Angelic Purge (inr) 333
1 Anje's Ravager (c19) 22
1 Blade Splicer (nph) 4
1 Bonecrusher Giant // Stomp (eld) 291
1 Brazen Borrower // Petty Theft (eld) 39
1 Cemetery Illuminator (vow) 50
1 Cemetery Prowler (vow) 191
1 Circular Logic (tor) 33
1 Coalition Relic (fut) 161
1 Crucible of Worlds (j13) 4
1 Dismember (nph) 57
1 Earthbender Ascension (tla) 175
1 Emry, Lurker of the Loch (brc) 81
1 Eternal Witness (p30a) 12
1 Extraction Specialist (snc) 407
1 Fiery Temper (c19) 142
1 Goblin Rabblemaster (pm15) 145
1 Grafted Wargear (5dn) 126
1 Grist, the Hunger Tide (mh2) 368
1 Hallowed Spiritkeeper (c14) 8
1 Intuition (tmp) 70
1 Kitchen Finks (shm) 229
1 Knight of the Reliquary (tsr) 379
1 Life // Death (apc) 130
1 Liliana, Heretical Healer // Liliana, Defiant Necromancer (ori) 106
1 Liliana of the Veil (isd) 105
1 Lingering Souls (dka) 12
1 Lurrus of the Dream-Den (mul) 51
1 Master of Death (mh2) 205
1 Master of Etherium (brc) 86
1 Monastery Mentor (frf) 20
1 Murderous Rider // Swift End (eld) 287
1 Nettlecyst (mh2) 231
1 Ophiomancer (c13) 84
1 Phoenix of Ash (thb) 148
1 Porcelain Legionnaire (nph) 19
1 Radha, Heart of Keld (m21) 224
1 Ramunap Excavator (cmr) 433
1 Raven Eagle (tla) 116
1 Reclamation Sage (pm15) 194
1 Recurring Nightmare (exo) 72
1 Scrap Trawler (aer) 175
1 Seasoned Pyromancer (2x2) 363
1 Sevinne's Reclamation (c19) 5
1 Skyclave Apparition (znr) 39
1 Spiteful Prankster (jmp) 26
1 Squee, Goblin Nabob (mb2) 247
1 Tameshi, Reality Architect (neo) 375
1 The Royal Scions (eld) 199
1 The Warring Triad (fic) 99
1 Tinker (v09) 14
1 Tireless Tracker (plst) SOI-233
1 Toxic Deluge (c13) 96
1 Trash for Treasure (c16) 136
1 Unnerving Grasp (dsk) 80
1 Uro, Titan of Nature's Wrath (thb) 229
1 Vendilion Clique (mm2) 67
1 Vesperlark (mh1) 35
1 Victimize (usg) 166
1 Woe Strider (thb) 123
1 Worn Powerstone (usg) 318
1 Ajani Vengeant (pala) 154★
1 Armageddon (3ed) 2
1 Blossoming Tortoise (woe) 163
1 Chandra, Torch of Defiance (kld) 110
1 Cogwork Librarian (cns) 58
1 Conclave Tribunal (grn) 6
1 Daretti, Scrap Savant (c14) 33
1 Dread Return (dmr) 302
1 Emeria Angel (zen) 11
1 Fact or Fiction (cmm) 631
1 Falkenrath Aristocrat (mm3) 163
1 Garruk Wildspeaker (m11) 175
1 Hellrider (dka) 93
1 Icetill Explorer (eoe) 388
1 Jace, the Mind Sculptor (wwk) 31
1 Jace, Wielder of Mysteries (war) 54
1 Karn, Scion of Urza (dom) 1
1 Lasyd Prowler (tdm) 149
1 Lethal Scheme (ncc) 36
1 Lodestone Golem (brr) 29
1 Phyrexian Metamorph (pnph) 42★
1 Pia and Kiran Nalaar (ori) 157
1 Rankle, Master of Pranks (eld) 101
1 Sanguinary Priest (40k) 53
1 Serra Paragon (dmu) 32
1 Stoke the Flames (m15) 164
1 The Wandering Emperor (neo) 42
1 Toski, Bearer of Secrets (khm) 319
1 Twinshot Sniper (neo) 168
1 Urza, Lord High Artificer (h1r) 11
1 Vengevine (roe) 212
1 Whirler Rogue (brc) 101
1 Wrath of God (10e) 61
1 Yawgmoth, Thran Physician (tsr) 336
1 Angel of Sanctions (c19) 61
1 Arcane Savant (cn2) 27
1 Batterskull (nph) 130
1 By Invitation Only (vow) 5
1 Deep Forest Hermit (mh1) 161
1 Deranged Hermit (ulg) 101
1 Golos, Tireless Pilgrim (m20) 226
1 Guardian Scalelord (moc) 103
1 Living Death (v14) 8
1 Mystic Confluence (tsr) 312
1 Reveillark (mma) 26
1 The Gitrog Monster (sld) 1051
1 Thundermaw Hellkite (m13) 150
1 Timeless Dragon (mh2) 388
1 Titania, Protector of Argoth (mh2) 416
1 Unburial Rites (isd) 122
1 Burning of Xinye (ptk) 104
1 Ethereal Forager (c20) 34
1 Generous Ent (ltr) 169
1 Grave Titan (pdp12) 2
1 Honored Hydra (akh) 172
1 Kogla, the Titan Ape (iko) 162
1 Oliphaunt (ltr) 426
1 Overlord of the Boilerbilges (dsk) 146
1 Primeval Titan (tsr) 365
1 Troll of Khazad-dûm (ltr) 111
1 Wurmcoil Engine (sld) 1661
1 Altanak, the Thrice-Called (dsk) 166
1 Gurmag Angler (tsr) 324
1 Hornet Queen (m15) 178
1 Murktide Regent (mh2) 337
1 Myr Battlesphere (brc) 151
1 Shadowgrange Archfiend (voc) 60
1 Somberwald Beastmaster (mic) 30
1 Threefold Thunderhulk (lci) 265
1 Dig Through Time (plg21) 2
1 Griselbrand (pgpx) 2015
1 Greater Gargadon (2x2) 453`
describe('url encoding', function() {
  test('compare encoding', async function() {
    const lines = BIG_LIST.split('\n');
    const cases = lines.map((_, index) => {
      return lines.slice(0, index).join(ENCODING_LINE_SEPARATOR)
    });
    const results = cases.map((testCase) => {
      const uriEncoded = encode(testCase)
      const uriLength = uriEncoded.length;

      const b64Encoded = b64encode(testCase)
      const b64Length = b64Encoded.length;

      let winner: string;

      if (uriLength === b64Length) {
        winner = 'tie';
      } else if (uriLength < b64Length) {
        winner = 'uri';
      } else {
        winner = 'b64';
      }

      return {
        winner,
        bestShortening: testCase.length - Math.min(b64Length, uriLength),
        testLength: testCase.length,
        testDifference: b64Length - uriLength,
        uriLength,
        uriShortening: testCase.length - uriLength,
        b64Length,
        b64Shortening: testCase.length - b64Length,
        uriEncoded,
        b64Encoded,
      }
    })

    const byWinner = lodash.groupBy(results, 'winner')

    let winner = { name: 'start' , wins: 0 };
    const winnerStats = {};
    for (const key in byWinner) {
      const challenger = byWinner[key];
      const improvementMean = lodash.mean(challenger.map(it => it.bestShortening));
      winnerStats[key] = {
        wins: challenger.length,
        improvementMean,
      }

      winner = winner.wins >= challenger.length
        ? winner
        : { name: key, wins: challenger.length };
    }
    expect(winner.name).toEqual('b64');
  })
})