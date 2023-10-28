import { barrysLand } from './testData/barrysLand'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { QueryRunner } from '../mql'
import { names } from './testData/_utils'

describe('oddEvenFilter', function() {
  const queryRunner = new QueryRunner({
    corpus: [barrysLand, delverOfSecrets]
  });
  it('should handle filtering for evens', function() {
    const result = names(queryRunner.search("mv=even"))

    expect(result).toEqual([barrysLand.name])
  })
  it('should handle filtering for odds', function() {
    const result = names(queryRunner.search("mv=odd"))

    expect(result).toEqual([delverOfSecrets.name])
  })
})