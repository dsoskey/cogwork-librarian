import { preordain } from './testData/preordain'
import { barrysLand } from './testData/barrysLand'
import { QueryRunner } from '../queryRunner'
import { defaultOptions, names } from './testData/_utils'
import { okoThiefOfCrowns } from './testData/okoThiefOfCrowns'

describe('identity filter', function() {
  const corpus = [barrysLand, preordain, okoThiefOfCrowns]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it('defaults to and handles <=', function() {
    const result = names(queryRunner.search("id<=u"))
    const defaultResult = names(queryRunner.search("id:u"))

    expect(result).toEqual([barrysLand.name, preordain.name])
    expect(result).toEqual(defaultResult)
  })

  it('= does an exact match', function() {
    const result = names(queryRunner.search("id=u"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(preordain.name)
  })

  it('handles <', function() {
    const result = names(queryRunner.search("id<u"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(barrysLand.name)
  })

  it('handles >', function() {
    const result = names(queryRunner.search("id>u"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(okoThiefOfCrowns.name)
  })

  it('handles >=', function() {
    const result = names(queryRunner.search("id>=u"))

    expect(result.length).toEqual(2)
    expect(result[0]).toEqual(okoThiefOfCrowns.name)
    expect(result[1]).toEqual(preordain.name)
  })

  it('handles colorless', function() {
    const result = names(queryRunner.search("id=c"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(barrysLand.name)
  })

  it('handles counting number of colors in identity', function() {
    const result = names(queryRunner.search("id=2"))

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(okoThiefOfCrowns.name)
  })
})