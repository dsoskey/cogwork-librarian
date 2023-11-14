import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { preordain } from './testData/preordain'
import { animateLand } from './testData/animateLand'

const corpus = [preordain, animateLand]
const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })

describe('set filter', function() {
  ["s", "set", "e", "edition"].forEach(filterKeyword => {
    it(`${filterKeyword} should match exact set codes`, async function() {
      const result = names(await queryRunner.search(`${filterKeyword}:m11`))

      expect(result).toEqual([preordain.name])
    })
  })
  it("should match exact set names", async function() {
    const result = names(await queryRunner.search('set:"Magic 2011"'))

    expect(result).toEqual([preordain.name])
  })
})

describe('set-type filter', function() {
  it("should match exact set types", async function() {
    const result = names(await queryRunner.search("st:core"))

    expect(result).toEqual([preordain.name])
  })
})