import { FilterNode } from './base'
import { printNode } from './print'

// TODO; deal with multi-face print-specific on everything that's relevant
export const flavorMatch = (value: string): FilterNode =>
  printNode(['flavor'], ({ printing }) => {
    return (
      printing.flavor_text?.toLowerCase().includes(value) ||
      printing.card_faces.filter((it) =>
        it.flavor_text?.toLowerCase().includes(value)
      ).length > 0
    )
  })

export const flavorRegex = (value: string): FilterNode =>
  printNode(['flavor-regex'], ({ printing }) => {
    const regexp = new RegExp(value)
    return (
      regexp.test(printing.flavor_text) ||
      printing.card_faces.filter((face) => regexp.test(face.flavor_text)).length > 0
    )
  })
