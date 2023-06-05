import { defaultCompare, Filter, FilterNode, Operator } from './base'
import { printNode } from './oracle'
import { Printing } from '../types/normedCard'

export const dateFilter = (operator: Operator, value: string): Filter<Printing> => {
  const valueDate = new Date(value)

  return (it) => {
    const printDate = new Date(it.released_at)
    if (isNaN(valueDate.getTime())) {
      throw Error(`${value} must fit date format yyyy or yyyy-MM-dd`)
    }
    if (isNaN(printDate.getTime())) {
      throw Error(`printing ${it.id} has a malformed released_at date. check your database for corruption.`)
    }

    // assume yyyy
    if (value.length === 4) {
      return defaultCompare(printDate.getUTCFullYear(), operator, valueDate.getUTCFullYear())
    }
    return defaultCompare(printDate.getTime(), operator, valueDate.getTime())
  }
}

export const dateNode = (operator: Operator, value: string): FilterNode => {
  return printNode(['date'], dateFilter(operator, value))
}