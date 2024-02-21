# /cubes/cardboard-theory

```queries
# Cardboard theory
is:token -t:card -t:stickers
-t:creature
t:creature

o:/ token/ -is:extra
o:create
-o:create
o:/a copy/

name:/^A\-/

# creatures matter
-is:token -is:extra
o:/Whenever a.+creature enters the battlefield under your control/

# artifacts matter
o:/Whenever a.+artifact enters the battlefield under your control/

# things that count
-is:token -is:extra
fo:/each .* you control/
fo:"s you control"
o:/costs .+ less/

# things that consume or care about it
-is:token -is:extra
o:"sacrifice a"
o:dies
t:creature

-is:token -is:extra
fo:/tap (all|an|two|three|four|five|six|seven|eight|nine|ten)/
keyword:convoke

# endless evil
-is:token -is:extra
t:horror
o:horror

# cycling related
o:"whenever you"
o:cycle
o:discard

is:permanent
o:"can't be blocked"
o:/gains (flying|menace|trample)/

# Some tribal
o:saproling or t:saproling

o:zombie or t:zombie

o:vampire or t:vampire

o:illusion or t:illusion

## Part 2
@a:ig(-kw:mutate -o:"take the initiative" -otag:tribal lang:en)

@alias:carb(cube:cardboard-canvas or cube:cardboard-theory)

# Every color has something they do better
# W: creature go wide
c:w 
#o:/create .* (tokens? )(?!with)/
o:/create .* (tokens?.* with)/
o:"create a 1/1"
o:"with flying"

# U: making token copies of non-tokens
c:u o:copy o:create

# B: creature sacrifice
c:b o:sacrifice
o:creature
o:token

c:b o:create

# R: artifact sacrifice
@u:ig c=r o:sacrifice
#o:artifact
#o:token
o:creature
mv<=4

c=g -o:create o:token
mv=2

# G: artifact go wide
c:g o:create
o:artifact
o:creature

ci:bw
o:sacrifice
o:enchantment
t:enchantment
-o:destroy

t:saga

# powerstones are dope
#"Svella, Ice Shaper"
o:powerstone

# creatures matter
-is:token -is:extra
o:/Whenever a.+creature enters the battlefield under your control/ o:/Whenever a.+creature enters the battlefield under your control/o:/Whenever a.+creature enters the battlefield under your control/o:/Whenever a.+creature enters the battlefield under your control/o:/Whenever a.+creature enters the battlefield under your control/

# artifacts matter
o:/Whenever a.+artifact enters the battlefield under your control/

# things that count
-is:token -is:extra
fo:/each .* you control/
fo:"s you control"
o:/costs .+ less/

# things that consume or care about it
-is:token -is:extra
o:"sacrifice a"
o:dies
t:creature

-is:token -is:extra
fo:/tap (all|an|two|three|four|five|six|seven|eight|nine|ten)/
keyword:convoke

@u:carb 
c>u

fo:/for each .* you control/

t:instant o:create

o:devour

o:nontoken

o:/\btoken\b/ -o:create

o:populate

o:create -is:extra
o:"3/3"

o:"2/2"

o:convoke

fo:"tap an untapped"

o:"enters the battlefield" c:u t:creature

cube:cardboard-theory c:u

@u:ig c=b mv<=2
o:artifact
o:token
o:sacrifice

layout:split

t:legendary (t:artifact or t:creature)

fo:"energy counter"

set:lcc order:set

o:"can't block this turn"

c=b o:destroy mv>0

c=b cube:cardboard-theory -cube:cardboard-canvas

otag:counter
o:create
o:noncreature


c=u mv=1 o:create -lang:ph

o:/tap an .* artifact/

otag:tap-fuel-artifact

otag:burn c=r -is:permanent o:artifact

fo:create fo:artifact c=b

o:/damage .* each .*creature/

kw:eternalize

otag:rescue-permanent t:creature
```

```cards
Trickster's Talisman
Artificer Class
Cackling Counterpart
Mirage Mockery
Quasiduplicate
Saheeli, Sublime Artificer
Irenicus's Vile Duplication
Mechanized Production
Repudiate // Replicate
Specimen Collector
Brudiclad, Telchor Engineer
Progenitor Mimic
Rhys the Redeemed
Citizen's Crowbar
Farmer Cotton
Of Herbs and Stewed Rabbit
Omen of the Sun
Three Blind Mice
Urza, Prince of Kroog
Boss's Chauffeur
Thalisse, Reverent Medium
Cabaretti Confluence
Staff of the Storyteller
Invasion of Tolvada // The Broken Sky
Scion of Vitu-Ghazi
Imaginary Friends
Shadow Summoning
Geist-Honored Monk
Migratory Route
Jinnie Fay, Jetmir's Second
Ghired, Conclave Exile
Cindervines
Claim the Firstborn
Nahiri's Warcrafting
Tamiyo, Compleated Sage
Deadly Dispute
Oni-Cult Anvil
Thopter Foundry
Denethor, Ruling Steward
Fain, the Broker
Skullport Merchant
Devouring Sugarmaw // Have for Dinner
Grim Hireling
Rite of Belzenlok
Corpsehatch
Start // Finish
Annihilating Glare
Dockside Chef
Plagued Rusalka
Gate to Phyrexia
Sunder the Gateway
Progenitor Exarch
Norn's Inquisitor
Chrome Host Seedshark
Compleated Huntmaster
Excise the Imperfect
Sokenzan Smelter
Gut, True Soul Zealot
Osgir, the Reconstructor
Voltage Surge
Makeshift Munitions
Incubation Sac
Oviya Pashiri, Sage Lifecrafter
Tough Cookie
Artifact Mutation
Merry, Warden of Isengard
Fade from History
Freyalise, Llanowar's Fury
Smelt // Herd // Saw
Crack Open
Svella, Ice Shaper
A-Elven Bow
Rhys the Redeemed
Royal Treatment
Termagant Swarm
Awaken the Woods
Boxing Ring
Courier's Briefcase
Farmer Cotton
Gala Greeters
Jolrael, Mwonvuli Recluse
Kazandu Tuskcaller
Mother Bear
Prizefight
Prosperous Innkeeper
Samwise Gamgee
Sprout Swarm
Saproling Migration
Teachings of the Kirin // Kirin-Touched Orochi
Welcome to Sweettooth
Arbalest Engineers
Call of the Herd
Fae Offering
Fungal Rebirth
Greta, Sweettooth Scourge
Grismold, the Dreadsower
Jugan Defends the Temple // Remnant of the Rising Star
Queen Allenal of Ruadach
The First Iroan Games
The Huntsman's Redemption
Trial of Strength
Undercellar Myconid
Bramble Sovereign
Incubation // Incongruity
Assault // Battery
Galadriel, Gift-Giver
Scatter the Seeds
Thragtusk
Armada Wurm
Euroakus
Hall of Tagsin
Horned Stoneseeker
Powerstone Engineer
Argothian Opportunist
Excavation Explosion
Gix's Caress
Urza, Powerstone Prodigy
Slagstone Refinery
Static Net
Urza's Command
Repair and Recharge
Dispeller's Capsule
Citizen's Crowbar
Fracture
Flicker of Fate
Battle for Bretagard
Of Herbs and Stewed Rabbit
The Restoration of Eiganjo // Architect of Restoration
Three Blind Mice
Oath of the Grey Host
Angelic Purge
Promise of Bunrei
Corpse Knight
Distinguished Conjurer
Impact Tremors
Champion of Lambholt
Witty Roastmaster
Teething Wurmlet
Reckless Fireweaver
Hedron Detonator
Glimmer Bairn
Gilded Goose
Dreg Recycler
Mold Folk
Aron, Benalia's Ruin
Compleated Huntmaster
Fain, the Broker
Gut, True Soul Zealot
Skullport Merchant
Gleeful Demolition
Song of Totentanz
Voldaren Epicure
Mogg War Marshal
Ratcatcher Trainee // Pest Problem
Ral's Reinforcements
Riveteers Requisitioner
Breya's Apprentice
Gadrak, the Crown-Scourge
Hordeling Outburst
Imodane's Recruiter // Train Troops
Improvised Weaponry
Mahadi, Emporium Master
Ob Nixilis, the Adversary
Start // Fire
Thopter Engineer
Pia and Kiran Nalaar
omen hawker
Fungal Infection
A-Hobbling Zombie
Emergency Weld
Mintstrosity
Shadow Summoning
Blood Fountain
Feed the Cauldron
Lord Skitter, Sewer King
Bake into a Pie
Deadly Derision
Mirkwood Bats
Sorin, Lord of Innistrad
Old Flitterfang
Royal Warden
Nadier, Agent of the Duskenel
Hard Evidence
Combine Chrysalis
Protect the Negotiators
Alirios, Enraptured
Aether Channeler
Invasion of Segovia // Caetus, Sea Tyrant of Segovia
Quasiduplicate
Murmuring Mystic
Thopter Spy Network
Repudiate // Replicate
Flip the Switch
Launch Mishap
Ancestral Blade
Resolute Reinforcements
Steward of Solidarity
Vitu-Ghazi Guildmage
Hanged Executioner
King Darien XLVIII
Mage's Attendant
Prava of the Steel Legion
Rosie Cotton of South Lane
Bennie Bracks, Zoologist
Defiler of Faith
Westvale Abbey // Ormendahl, Profane Prince
Wall of Kelp
Chain of Vapor
Machine Over Matter
Shelob's Ambush
```
