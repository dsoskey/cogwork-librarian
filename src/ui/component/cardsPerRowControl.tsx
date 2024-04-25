import React from "react";
import { Setter } from '../../types'

export interface CardsPerRowControlProps {
    cardsPerRow: number
    setCardsPerRow: Setter<number>
}

export function CardsPerRowControl({cardsPerRow, setCardsPerRow}: CardsPerRowControlProps) {

    return <div>
        <label>
            <strong>cards per row: </strong>
            <select value={cardsPerRow} onChange={e => setCardsPerRow(parseInt(e.target.value))}>
                <option value={4}>4</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
            </select>
        </label>
    </div>;
}

