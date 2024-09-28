import React, { useContext } from 'react'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { LoaderText } from '../component/loaders'
import { DataProps, DataTable } from '../data/dataTable'
import { Link } from 'react-router-dom'
import _sortBy from 'lodash/sortBy'
import "./cubeSearch.css"
import { CardToOracleTag } from '../../api/local/types/tags'
export interface CubeTagsProps {

}

const showTags = new Set([
  "_total_",
    "card-advantage",
    "life-payment",
    "recursion",
    "removal",
    "creature-removal",
    "draw",
    "tutor",
    "reanimate",
    "ramp",
    "evasion",
    "discard-outlet",
    "sacrifice-outlet",
    "burn",
    "tutor-battlefield",
    "repeatable-token-generator",
    "lifegain",
    "mill",
    "utility-land",
    "planeswalker-removal",
    "creature-type-erratum",
    "boardwipe",
    "counterspell",
    "mana-sink",
    "cantrip",
    "discard",
    "manland",
])
const ignoreTags = new Set<string>()
export function CubeTags({}: CubeTagsProps) {
    const { otags, cards, oracleMap } = useContext(CubeViewModelContext)
    if (otags === null) return <LoaderText />
    const colorBreakdown = bucketizeTagsByColor(otags, cards)
      .filter(it => showTags.has(it.tag));
    return <div className="cube-list-root">

        <DataTable data={colorBreakdown} stickyHeader ignoreKeys={ignoreTags} keyKey={"tag"} customRenders={{
            tag: TagLink,
        }} />
    </div>;
}

export function TagLink({ value }:DataProps) {
    if (value === "_total_") return "total"
    return <Link to={`/data/otag/${value}`}>{value}</Link>
}

export interface ColorBreakdown {
    tag: string
    w: number
    u: number
    b: number
    r: number
    g: number
    m: number
    c: number
    total: number
}

function bucketizeTagsByColor(otags: CardToOracleTag[], cards: OrderedCard[]) {
    const dict: { [key: string]: ColorBreakdown} = {
        _total_: { tag: "_total_", w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 }
    };
    for (let i = 0; i < cards.length; i++) {
        const ctoo = otags[i];
        const card = cards[i];

        let key = "c";
        if (card.colors === undefined || card.colors.length === 0) {
            key = "c";
        } else if (card.colors.length > 1) {
            key = "m";
        } else {
            key = card.colors[0].toLowerCase()
        }
        for (let otag of ctoo?.otags ?? []) {
            if (!(otag in dict)) {
                dict[otag] = { tag: otag, w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 }
            }
            dict[otag][key]++;
            dict[otag].total++;
        }

        dict._total_[key]++;
        dict._total_.total++;
    }
    const result = Object.values(dict)
    return _sortBy(result, [(it) => -it.total, "tag"]);
}