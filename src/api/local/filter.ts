import { Collection, IndexableType } from "dexie"
import { Card } from "scryfall-sdk"
import { cogDB, CardKeys, TypedDexie } from "./db"

export type EqualityOperator = ":" | "="

export type Operator = EqualityOperator | "!=" | "<>" | "<" | "<=" | ">" | ">="

export type CardCollection = Collection<Pick<Card, CardKeys>, IndexableType>

export class FilterWrapper {
    db: TypedDexie
    constructor(db: TypedDexie) {
        this.db = db
    }

    root = () => this.db.card.toCollection()

    where = (field: string) => this.db.card.where(field)

    or = (collection: CardCollection): CardCollection => collection.or("id").notEqual(null)

    // TODO: HOF-ify
    defaultOperation = (field: CardKeys, operator: Operator, value: any): CardCollection => {    
        switch (operator) {
            case ":":
            case "=":
                return this.root().and((card: Card) => card[field] === value)
            case "!=":
            case "<>":
                return this.root().and((card: Card) => card[field] !== value)
            case "<":
                return this.root().and((card: Card) => card[field] < value)
            case "<=":
                return this.root().and((card: Card) => card[field] <= value)
            case ">":
                return this.root().and((card: Card) => card[field] > value)
            case ">=":
                return this.root().and((card: Card) => card[field] >= value)
        }
    }

    subbed = (text: string, value: string): string => {
        return text.replace(/~/g, value).toLowerCase()
    }

    oracleText = (value: string): CardCollection => {
        return this.root().filter(card => {
            return card.oracle_text?.toLowerCase()
                .includes(this.subbed(value, card.name))
        })
    }

    oracleRegex = (value: string): CardCollection => {
        return this.root().filter(card => new RegExp(this.subbed(value, card.name))
            .test(card.oracle_text.toLowerCase())
        )
    }
}

export const Filters = new FilterWrapper(cogDB)