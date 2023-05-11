import { defaultCompare, Filter, FilterNode, Operator } from './base'
import { printNode } from './oracle'
import { Printing } from '../types/normedCard'

export const dateFilter = (operator: Operator, value: string): Filter<Printing> => {
  const valueDate = new Date(value)

  return (it) => {
    const printDate = new Date(it.released_at)
    if (isNaN(valueDate.getTime())) {
      throw `${value} must fit date format yyyy-MM-dd`
    }
    if (isNaN(printDate.getTime())) {
      throw `printing ${it.id} has a malformed released_at date. check your database for corruption.`
    }

    return defaultCompare(printDate, operator, valueDate)
  }
}

export const dateNode = (operator: Operator, value: string): FilterNode => {
  return printNode(['date'], dateFilter(operator, value))
}