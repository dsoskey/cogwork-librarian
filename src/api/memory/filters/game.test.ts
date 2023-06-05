import { asymmetrySage } from './testData/asymmetrySage'
import { barrysLand } from './testData/barrysLand'
import { zodiacDragonMtgo } from './testData/zodiacDragon'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'

describe('game filter', function() {
  const corpus = [asymmetrySage, barrysLand, zodiacDragonMtgo]
  const queryRunner = new QueryRunner(corpus, defaultOptions)
  it("includes cards present in arena", function() {
    const result = queryRunner.search("game:arena")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(asymmetrySage.id)
  })
it("includes cards present in paper", function() {
    const result = queryRunner.search("game:paper")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(barrysLand.id)
  })
it("includes cards present in mtgo", function() {
    const result = queryRunner.search("game:mtgo")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(zodiacDragonMtgo.id)
  })
})