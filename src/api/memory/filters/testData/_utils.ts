import { SearchOptions } from '../../types/searchOptions'
import { Result } from 'neverthrow'
import { Card } from 'scryfall-sdk'
import { SearchError } from '../../types/error'
import { MemoryDataProvider } from '../dataProvider'

export const defaultOptions: SearchOptions = { order: 'name' }

export const defaultDataProvider = new MemoryDataProvider({
  cubes: [], atags: [], otags: [],
})

export const names = (result: Result<Card[], SearchError>) =>
  result._unsafeUnwrap().map(it => it.name)