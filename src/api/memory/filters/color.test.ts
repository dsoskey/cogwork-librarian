import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { preordain } from './testData/preordain'
import { QueryRunner } from '../mql'
import { defaultOptions, names } from './testData/_utils'
import { davrielsWithering } from './testData/davrielsWithering'
import { thoughtKnotSeer } from './testData/thoughtKnotSeer'

describe('color filters', function() {
  const corpus = [preordain, davrielsWithering, aetherbladeAgent, kroxaTitanOfDeathsHunger, thoughtKnotSeer]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })

  it('handles the default for :, >=', () => {
    const result = names(queryRunner.search("c>=b"))
    const defaultResult = names(queryRunner.search("c:b"))

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
    expect(defaultResult).toEqual(result)
  })

  it('handles =, including cards with any face that matches', () => {
    const result = names(queryRunner.search("c=b"))

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name])
  })

  it('handles !=', () => {
    const result = names(queryRunner.search("c!=b"))

    expect(result).toEqual([preordain.name, thoughtKnotSeer.name])
  })

  it('handles >', () => {
    const result = names(queryRunner.search("c>b"))

    expect(result).toEqual([aetherbladeAgent.name, kroxaTitanOfDeathsHunger.name])
  })

  it('handles <', () => {
    const result = names(queryRunner.search("c<rakdos"))

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name, thoughtKnotSeer.name])
  })

  it('handles <=', () => {
    const result = names(queryRunner.search("c<=rakdos"))

    expect(result).toEqual([
      aetherbladeAgent.name,
      davrielsWithering.name,
      kroxaTitanOfDeathsHunger.name,
      thoughtKnotSeer.name
    ])
  })

  it('handles colorless', () => {
    const result = names(queryRunner.search("c=c"))

    expect(result).toEqual([thoughtKnotSeer.name])
  })

  it('handles color count filters', function () {
    const result = names(queryRunner.search("c=2"))

    expect(result).toEqual([aetherbladeAgent.name, kroxaTitanOfDeathsHunger.name])
  })
})