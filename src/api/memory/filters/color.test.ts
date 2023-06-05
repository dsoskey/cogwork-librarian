import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { preordain } from './testData/preordain'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { davrielsWithering } from './testData/davrielsWithering'
import { thoughtKnotSeer } from './testData/thoughtKnotSeer'

describe('color filters', function() {
  const corpus = [preordain, davrielsWithering, aetherbladeAgent, kroxaTitanOfDeathsHunger, thoughtKnotSeer]
  const queryRunner = new QueryRunner(corpus, defaultOptions)

  it('handles the default for :, >=', () => {
    const result = queryRunner.search("c>=b")._unsafeUnwrap()
    const defaultResult = queryRunner.search("c:b")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, davrielsWithering, kroxaTitanOfDeathsHunger])
    expect(defaultResult).toEqual(result)
  })

  it('handles =, including cards with any face that matches', () => {
    const result = queryRunner.search("c=b")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, davrielsWithering])
  })

  it('handles !=', () => {
    const result = queryRunner.search("c!=b")._unsafeUnwrap()

    expect(result).toEqual([preordain, thoughtKnotSeer])
  })

  it('handles >', () => {
    const result = queryRunner.search("c>b")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, kroxaTitanOfDeathsHunger])
  })

  it('handles <', () => {
    const result = queryRunner.search("c<rakdos")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, davrielsWithering, thoughtKnotSeer])
  })

  it('handles <=', () => {
    const result = queryRunner.search("c<=rakdos")._unsafeUnwrap()

    expect(result).toEqual([
      aetherbladeAgent,
      davrielsWithering,
      kroxaTitanOfDeathsHunger,
      thoughtKnotSeer
    ])
  })

  it('handles colorless', () => {
    const result = queryRunner.search("c=c")._unsafeUnwrap()

    expect(result).toEqual([thoughtKnotSeer])
  })

  it('handles color count filters', function () {
    const result = queryRunner.search("c=2")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, kroxaTitanOfDeathsHunger])
  })
})