import { NormedCard } from '../types/normedCard'
import { Filter } from './base'
import { anyFaceContains } from '../types/card'

const withoutDiacritics = (str: string): string => {
  let result = str.split("")
  for (let i = 0; i < result.length; i++) {
    switch (result[i]) {
      case 'á':
      case 'â':
      case 'ã':
      case 'à':
      case 'ä':
        result[i] = 'a';
        break;
      case 'é':
        result[i] = 'e';
        break;
      case 'í':
        result[i] = 'i';
        break;
      case 'ñ':
        result[i] = 'n';
        break;
      case 'ó':
      case 'ö':
        result[i] = 'o';
        break;
      case 'š':
        result[i] = 's';
        break;
      case 'ú':
      case 'ü':
        result[i] = 'u';
        break;
      default:
        break;
    }
  }

  return result.join("")
}

export const nameFilter = (name: string): Filter<NormedCard> => (card) => {
  return anyFaceContains(card, "name", name) ||
    anyFaceContains(card, "name", name, withoutDiacritics)
}