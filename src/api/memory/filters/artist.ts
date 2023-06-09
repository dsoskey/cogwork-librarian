import { FilterNode } from './base'
import { printNode } from './print'

/**
 * @param value - lower-cased artist substring.
 */
export const artistNode = (value: string): FilterNode =>
  printNode(['artist'], (it) => it.artist.toLowerCase().includes(value))
