import {Card} from "scryfall-sdk";
import {CardKeys} from "../local/db";

export type Filter<T> = (T) => boolean

export type EqualityOperator = ":" | "="

export type Operator = EqualityOperator | "!=" | "<>" | "<" | "<=" | ">" | ">="

export class MemoryFilterWrapper {
    constructor() {
    }

    identity = (): Filter<Card> => (_) => true

    and = (clause1: Filter<Card>, clause2: Filter<Card>): Filter<Card> => {
        return (c: Card) => clause1(c) && clause2(c)
    }

    or = (clause1: Filter<Card>, clause2: Filter<Card>): Filter<Card> => {
        return (c: Card) => clause1(c) || clause2(c)
    }

    not = (clause: Filter<Card>): Filter<Card> => {
        return (c: Card) => !clause(c)
    }

    defaultOperation = (field: CardKeys, operator: Operator, value: any): Filter<Card> => (card: Card) => {
        const cardValue = card[field]
        switch (operator) {
            case ":":
            case "=":
                return cardValue === value
            case "!=":
            case "<>":
                return cardValue !== value
            case "<":
                return cardValue < value
            case "<=":
                return cardValue <= value
            case ">":
                return cardValue > value
            case ">=":
                return cardValue >= value
        }
    }

    powTouOperation = (field: CardKeys, operator: Operator, value: any): Filter<Card> => (card: Card) => {
        const cardValue = card[field]
        if (cardValue === undefined) return false

        const parsed = Number.parseInt(cardValue.toString(), 10)
        switch (operator) {
            case ":":
            case "=":
                return parsed === value
            case "!=":
            case "<>":
                return parsed !== value
            case "<":
                return parsed < value
            case "<=":
                return parsed <= value
            case ">":
                return parsed > value
            case ">=":
                return parsed >= value
        }
    }

    subbed = (text: string, value: string): string => {
        return text.replace(/~/g, value).toLowerCase()
    }

    oracleText = (value: string): Filter<Card> => {
        console.log(value)
        return (card => card.oracle_text?.toLowerCase()
            .includes(this.subbed(value, card.name))
        )
    }

    oracleRegex = (value: string): Filter<Card> => {
        return (card: Card) => {
            return new RegExp(this.subbed(value, card.name))
                .test((card.oracle_text ?? "").toLowerCase())
        }
    }
}

export const Filters = new MemoryFilterWrapper()