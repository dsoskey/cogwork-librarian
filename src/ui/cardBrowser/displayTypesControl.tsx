import React from "react";
import { ActiveCollection, activeCollections, DisplayType } from './types'
import { Setter } from '../../types'


const collectionOptions: Record<ActiveCollection, string> = {
    search: 'results',
    ignore: 'ignored'
}

export interface DisplayTypesControlProps {
    displayType: DisplayType
    setDisplayType: Setter<DisplayType>
    activeCollection: ActiveCollection
    setActiveCollection: Setter<ActiveCollection>
}

export function DisplayTypesControl({
    displayType,
    setDisplayType,
    activeCollection,
    setActiveCollection,
}: DisplayTypesControlProps) {

    return <label className='display-type'>
        <span className="bold">show{" "}</span>
        <select value={activeCollection}
                onChange={event => setActiveCollection(event.target.value as ActiveCollection)}>
            {Object.values(activeCollections).map(it => <option key={it} value={it}>{collectionOptions[it]}</option>)}
        </select>
        <span className="bold">{" "}as:{" "}</span>
        <select value={displayType} onChange={event => setDisplayType(event.target.value as DisplayType)}>
            <option value="cards">images</option>
            <option value="viz">data viz (alpha)</option>
        </select>
    </label>;
}

