import { SearchOptions } from '../../types/searchOptions'
import { Result } from 'neverthrow'
import { Card } from 'scryfall-sdk'
import { SearchError } from '../../queryRunner'

export const defaultOptions: SearchOptions = { order: 'name' }

export const names = (result: Result<Card[], SearchError>) =>
  result._unsafeUnwrap().map(it => it.name)