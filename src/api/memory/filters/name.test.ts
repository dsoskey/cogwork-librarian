import { QueryRunner } from '../queryRunner'
import { eomerKingOfRohan } from './testData/eomerKingOfRohan'

describe('name filter', function() {
  it('should handle diacritics', function() {
    const runner = new QueryRunner({
      corpus: [eomerKingOfRohan]
    })
    const result = runner.search("name:eomer")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([eomerKingOfRohan.name])
  })
})