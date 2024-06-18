# git cube: _its git, for your cube!_

Current cube tooling manages your cube history for you, but none of the major tools let users look at a historical snapshot of their cube. Generating these snapshots manually takes too much time and is too error prone. Changelog data can become stale when upstream data sources change card ids, leaving curators guessing their exact changes from 4 years ago. Current cube tooling also lacks branching; curators who want several variations of the same cube must manage separate clones of the same cube, fragmenting the information and adding work to keep each one updated. For example, large, sponsored events require WOTC printed cards and some curators create clones of their cubes for the event. Instead of weakly linking the clone back to the original, it could be created and managed as a git branch or tagged commit.

## User anecdota

"But it's really super a shame that like this data is structured in a structured way. And yet I can't just say show me this cube on this date, right?" ~ Andy Mangold, LPR Episode 200

"I think that sounds like a great tool to track a cubes changes over time - useful for all designers. For me I run an algorithm to generate a cube so it seems like that could be a great integration" ~ Daniel aka l0gr1thm1k

"I want to store the ultimate source of truth locally and use sites like CubeCobra as a public mirror. I don't want to lose my entire cube history if a cube hosting site closes down" ~ Heather

## Tenets

1. Users own their data.
2. Data is simple to consume outside its planned software ecosystem (mtgql, cogwork librarian, etc.)

## Requirements

- Users can easily host their data on any git-compatible system.
- Users can view the state of a cube at any timestamp within the cube's lifetime
- Users can organize their cube among any number of lists (mainboard, on deck, rare modules, etc)
- Cube data can be fully analyzed on an offline device

## High-level plan

### 0. We're talking data

```
/cardboard-theory
 - README.MD (cube overview goes here)
 - BRAINSTORM.MD (cogwork librarian project file)
 - mainboard.txt (tsv? no extension?)
 - ondeck.txt
 - raremodule.txt
 - carddata.json
```

Each cube is a git repository, and consumers use git's commit history to provide point in time snapshots. Because data is stored in a git repository, we get to leverage files to isolate different cube packages from each other. Each package is its own txt file named the same as the package. Most cubes will have a `mainboard.txt` and a `maybeboard.txt`, but curators can name their files anything they wish. This flexibility supports fully modular cubes and jumpstart boxes, environments that don't use a core set of cards every time you play them. Outside of cube package files, the repo contains the cube overview in README.md and optional card data for all cards in all packages. Consumers can use this information for cube view UIs and card analytics.
Still considering: a cube metadata file and future tooling config files.

#### mainboard.txt, what does it look like?

plaintext file of tab separated values. the first row lists the column headers,
which is used to detect which overrides are used. how do we represent nulls? 
`~~` could be a good value, as it isn't used in any card fields. name and id are required,
all overrides are optional. See mtgql's [CubeCard](https://github.com/dsoskey/mtgql-js/blob/main/models/card_definition.json)
for the full list of potential overrides used by other popular cube sites,
but there's nothing in this design that restricts what is in an override 
(except for tabs and newlines obv, those need to be encoded).

```
id          name    *Overrides...   ...
deadbeef    Fire // Ice  ... ...
bbbbbbbb    Dark Confidant  .. ...
710babba    Battle Bus .. ...
```


**Alt proposal**: name set collectorNumber. id is compound of set-cn.
collector numbers disambiguate using scryfall's bulk data collector numbers
, add scryfall_id field to card. big benefit: this approach is more universal in other magic software.

```
name    set     cn  Overrides...
Fire // Ice  ddj    14  ...
Dark Confidant  rva 81  ...
Battle Bus  sld  420  ...
```

#### carddata.json, what does it look like?

This file contains a list of mtgql-compatible cards referenced in all package files

```typescript
import { Card } from 'mtgql-js'

type CardData = Card[]
```

### 1. Canal Dredger

Users start with the data ingestion tool, Canal Dredger. It accepts a cubecobra/cubeartisan id and optionally scraped cubetutor data, fetches the current cube and cube history, then generates a snapshot of the cube in between each change. Dredger creates a git repo with a single commit for each snapshot in chronological order. Dredger sets the author, author_timestamp, and the commit message based on the change that results in the snapshot being committed.

```shell
# Example git commands
git add *.txt
git commit \
	--date="2020-04-20:16:20:00" \ # timestamp of cube update
	-m "Blog Post Title" \
	-m "Blog Post Contents" \
	-m "Text version of changelog to preserve replacement notes"
	--author="Guy User <guyuser@example.com>"
```

### 2. Snapshot Visualizer

Assuming I can get an in memory git client running this might live in cogwork librarian.

Where to run it:

- desktop application, possibly with Tauri and reusing cogwork librarian frontend. this is currently the most appealing option, as it builds towards cogwork librarian's larger goals.
- local proxy. this requires a lot more user setup than a standalone application at marginal benefit if any

Tool workflows

1. historical timeline: `git log`
2. individual snapshots: `git checkout 3140f7029abd...`
3. get current version: `git checkout HEAD`
4. cube view
   1. local
      1. process carddata.json
      2. normalize cards onto each package row, adding overrides to each RowCard
   2. import to various cube sites
