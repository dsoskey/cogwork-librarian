import { preordain } from './testData/preordain'
import { barrysLand } from './testData/barrysLand'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { okoThiefOfCrowns } from './testData/okoThiefOfCrowns'

describe('identity filter', function() {
  const corpus = [barrysLand, preordain, okoThiefOfCrowns]
  const queryRunner = new QueryRunner(corpus, defaultOptions)
  it('defaults to and handles <=', function() {
    const result = queryRunner.search("id<=u")._unsafeUnwrap()
    const defaultResult = queryRunner.search("id:u")._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0]).toEqual(barrysLand)
    expect(result[1]).toEqual(preordain)
    expect(result).toEqual(defaultResult)
  })

  it('= does an exact match', function() {
    const result = queryRunner.search("id=u")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(preordain)
  })

  it('handles <', function() {
    const result = queryRunner.search("id<u")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(barrysLand)
  })

  it('handles >', function() {
    const result = queryRunner.search("id>u")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(okoThiefOfCrowns)
  })

  it('handles >=', function() {
    const result = queryRunner.search("id>=u")._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0]).toEqual(okoThiefOfCrowns)
    expect(result[1]).toEqual(preordain)
  })

  it('handles colorless', function() {
    const result = queryRunner.search("id=c")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(barrysLand)
  })

  it('handles counting number of colors in identity', function() {
    const result = queryRunner.search("id=2")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0]).toEqual(okoThiefOfCrowns)
  })
})