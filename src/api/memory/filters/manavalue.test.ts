import { barrysLand } from './testData/barrysLand'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { QueryRunner } from '../queryRunner'

describe('oddEvenFilter', function() {
  const queryRunner = new QueryRunner({
    corpus: [barrysLand, delverOfSecrets]
  });
  it('should handle filtering for evens', function() {
    const result = queryRunner.search("mv=even")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([barrysLand.name])
  })
  it('should handle filtering for odds', function() {
    const result = queryRunner.search("mv=odd")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([delverOfSecrets.name])
  })
})