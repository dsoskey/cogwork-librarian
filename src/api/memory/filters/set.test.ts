import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { preordain } from './testData/preordain'
import { animateLand } from './testData/animateLand'

const corpus = [preordain, animateLand]
const queryRunner = new QueryRunner(corpus, defaultOptions)

describe('set filter', function() {
  ["s", "set", "e", "edition"].forEach(filterKeyword => {
    it(`${filterKeyword} should match exact set codes`, function() {
      const result = queryRunner.search(`${filterKeyword}:m11`)._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(preordain.id)
    })
  })
  it("should match exact set names", function() {
    const result = queryRunner.search('set:"Magic 2011"')._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(preordain.id)
  })
})

describe('set-type filter', function() {
  it("should match exact set types", function() {
    const result = queryRunner.search("st:core")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(preordain.id)
  })
})