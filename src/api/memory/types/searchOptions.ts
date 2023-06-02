import { SearchOptions as SdkSearchOptions, Sort } from 'scryfall-sdk'

export interface SearchOptions extends SdkSearchOptions {
  order: keyof typeof Sort;
}