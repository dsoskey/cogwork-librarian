import { QueryRunner } from '../queryRunner'
import { eomerKingOfRohan } from './testData/eomerKingOfRohan'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'

describe('name filter', function() {
  it('should handle diacritics', async function() {
    const runner = new QueryRunner({
      corpus: [eomerKingOfRohan],
      defaultOptions,
      dataProvider: defaultDataProvider,
    })
    const result = names(await runner.search("name:eomer"))

    expect(result).toEqual([eomerKingOfRohan.name])
  })
})