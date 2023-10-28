import { asymmetrySage } from './testData/asymmetrySage'
import { barrysLand } from './testData/barrysLand'
import { zodiacDragonMtgo } from './testData/zodiacDragon'
import { QueryRunner } from '../mql'
import { defaultOptions, names } from './testData/_utils'

describe('game filter', function() {
  const corpus = [asymmetrySage, barrysLand, zodiacDragonMtgo]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it("includes cards present in arena", function() {
    const result = names(queryRunner.search("game:arena"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(asymmetrySage.name)
  })
it("includes cards present in paper", function() {
    const result = names(queryRunner.search("game:paper"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(barrysLand.name)
  })
it("includes cards present in mtgo", function() {
    const result = names(queryRunner.search("game:mtgo"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(zodiacDragonMtgo.name)
  })
})