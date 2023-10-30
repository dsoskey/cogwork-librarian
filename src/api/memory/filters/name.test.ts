import { QueryRunner } from '../queryRunner'
import { eomerKingOfRohan } from './testData/eomerKingOfRohan'
import { names } from './testData/_utils'

describe('name filter', function() {
  it('should handle diacritics', function() {
    const runner = new QueryRunner({
      corpus: [eomerKingOfRohan]
    })
    const result = names(runner.search("name:eomer"))

    expect(result).toEqual([eomerKingOfRohan.name])
  })
})