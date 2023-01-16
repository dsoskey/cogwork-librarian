import {Card} from "scryfall-sdk";
import {CardKeys} from "../local/db";

export type Filter<T> = (T) => boolean

export type EqualityOperator = ":" | "="

export type Operator = EqualityOperator | "!=" | "<>" | "<" | "<=" | ">" | ">="

// these should go on the card object itself
export const parsePowTou = (value: any) => value !== undefined ?
    Number.parseInt(value.toString().replace("*", "0"), 10) :
    0

const replaceNamePlaceholder = (text: string, name: string): string => {
    return text.replace(/~/g, name).toLowerCase()
}

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
        if (cardValue === undefined) return false
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

    powTouOperation = (field: CardKeys, operator: Operator, targetValue: number): Filter<Card> => (card: Card) => {
        const cardValue = card[field]
        if (cardValue === undefined) return false

        const valueToTest = parsePowTou(cardValue)
        switch (operator) {
            case ":":
            case "=":
                return valueToTest === targetValue
            case "!=":
            case "<>":
                return valueToTest !== targetValue
            case "<":
                return valueToTest < targetValue
            case "<=":
                return valueToTest <= targetValue
            case ">":
                return valueToTest > targetValue
            case ">=":
                return valueToTest >= targetValue
        }
    }

    textMatch = (field: CardKeys, value: string): Filter<Card> => card =>
        card[field]?.toString()
            .toLowerCase()
            .includes(replaceNamePlaceholder(value, card.name))

    regexMatch = (field: CardKeys, value: string): Filter<Card> => card =>
        new RegExp(replaceNamePlaceholder(value, card.name))
            .test((card[field] ?? "").toLowerCase())

    colorMatch = (operator: Operator, value: Set<string>): Filter<Card> => (card: Card) => {
        if (card.colors === undefined) return false
        const colors = card.colors.map(it => it.toLowerCase())
        const matchedColors = colors.filter(color => value.has(color))
        const notMatchedColors = colors.filter(color => !value.has(color))
        switch (operator) {
            case "=":
                return matchedColors.length === value.size && notMatchedColors.length === 0
            case "!=":
                return matchedColors.length === 0
            case "<":
                return notMatchedColors.length === 0 && matchedColors.length < value.size
            case "<=":
                return notMatchedColors.length === 0 && matchedColors.length <= value.size
            case ">":
                return notMatchedColors.length > 0 && matchedColors.length === value.size
            // Scryfall adapts ":" to the context. in this context it acts as >=
            case ":":
            case ">=":
                return matchedColors.length === value.size
            case "<>":
                throw "throw something better please!"
        }
    }

    colorIdentityMatch = (operator: Operator, value: Set<string>): Filter<Card> => (card: Card) => {
        if (card.colors === undefined) return false
        const colors = card.colors.map(it => it.toLowerCase())
        const matchedColors = colors.filter(color => value.has(color))
        const notMatchedColors = colors.filter(color => !value.has(color))
        switch (operator) {
            case "=":
                return matchedColors.length === value.size && notMatchedColors.length === 0
            case "!=":
                return matchedColors.length === 0
            case "<":
                return notMatchedColors.length === 0 && matchedColors.length < value.size
            // Scryfall adapts ":" to the context. in this context it acts as <=
            case ":":
            case "<=":
                return notMatchedColors.length === 0 && matchedColors.length <= value.size
            case ">":
                return notMatchedColors.length > 0 && matchedColors.length === value.size
            case ">=":
                return matchedColors.length === value.size
            case "<>":
                throw "throw something better please!"
        }
    }
}

export const Filters = new MemoryFilterWrapper()