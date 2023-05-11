import { FilterNode } from './base'
import { printNode } from './oracle'

export const artistNode = (value: string): FilterNode =>
  printNode(['artist'], (it) => it.artist.toLowerCase().includes(value))
