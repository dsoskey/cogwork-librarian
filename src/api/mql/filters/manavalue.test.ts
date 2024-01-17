import { barrysLand } from './testData/barrysLand'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'

describe('oddEvenFilter', function() {
  const queryRunner = new QueryRunner({
    corpus: [barrysLand, delverOfSecrets],
    defaultOptions,
    dataProvider: defaultDataProvider,
  });
  it('should handle filtering for evens', async function() {
    const result = names(await queryRunner.search("mv=even"))

    expect(result).toEqual([barrysLand.name])
  })
  it('should handle filtering for odds', async function() {
    const result = names(await queryRunner.search("mv=odd"))

    expect(result).toEqual([delverOfSecrets.name])
  })
})