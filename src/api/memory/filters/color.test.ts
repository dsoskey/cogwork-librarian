import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { preordain } from './testData/preordain'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { davrielsWithering } from './testData/davrielsWithering'
import { thoughtKnotSeer } from './testData/thoughtKnotSeer'

describe('color filters', function() {
  const corpus = [preordain, davrielsWithering, aetherbladeAgent, kroxaTitanOfDeathsHunger, thoughtKnotSeer]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })

  it('handles the default for :, >=', () => {
    const result = queryRunner.search("c>=b")._unsafeUnwrap().map(it => it.name)
    const defaultResult = queryRunner.search("c:b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
    expect(defaultResult).toEqual(result)
  })

  it('handles =, including cards with any face that matches', () => {
    const result = queryRunner.search("c=b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name])
  })

  it('handles !=', () => {
    const result = queryRunner.search("c!=b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([preordain.name, thoughtKnotSeer.name])
  })

  it('handles >', () => {
    const result = queryRunner.search("c>b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([aetherbladeAgent.name, kroxaTitanOfDeathsHunger.name])
  })

  it('handles <', () => {
    const result = queryRunner.search("c<rakdos")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name, thoughtKnotSeer.name])
  })

  it('handles <=', () => {
    const result = queryRunner.search("c<=rakdos")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([
      aetherbladeAgent.name,
      davrielsWithering.name,
      kroxaTitanOfDeathsHunger.name,
      thoughtKnotSeer.name
    ])
  })

  it('handles colorless', () => {
    const result = queryRunner.search("c=c")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([thoughtKnotSeer.name])
  })

  it('handles color count filters', function () {
    const result = queryRunner.search("c=2")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([aetherbladeAgent.name, kroxaTitanOfDeathsHunger.name])
  })
})