import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { preordain } from './testData/preordain'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { davrielsWithering } from './testData/davrielsWithering'
import { thoughtKnotSeer } from './testData/thoughtKnotSeer'

describe('color filters', function() {
  const corpus = [preordain, davrielsWithering, aetherbladeAgent, kroxaTitanOfDeathsHunger, thoughtKnotSeer]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })

  it('handles the default for :, >=', async () => {
    const result = names(await queryRunner.search("c>=b"))
    const defaultResult = names(await queryRunner.search("c:b"))

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
    expect(defaultResult).toEqual(result)
  })

  it('handles =, including cards with any face that matches', async () => {
    const result = names(await queryRunner.search("c=b"))

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name])
  })

  it('handles !=', async () => {
    const result = names(await queryRunner.search("c!=b"))

    expect(result).toEqual([preordain.name, thoughtKnotSeer.name])
  })

  it('handles >', async () => {
    const result = names(await queryRunner.search("c>b"))

    expect(result).toEqual([aetherbladeAgent.name, kroxaTitanOfDeathsHunger.name])
  })

  it('handles <', async () => {
    const result = names(await queryRunner.search("c<rakdos"))

    expect(result).toEqual([aetherbladeAgent.name, davrielsWithering.name, thoughtKnotSeer.name])
  })

  it('handles <=', async () => {
    const result = names(await queryRunner.search("c<=rakdos"))

    expect(result).toEqual([
      aetherbladeAgent.name,
      davrielsWithering.name,
      kroxaTitanOfDeathsHunger.name,
      thoughtKnotSeer.name
    ])
  })

  it('handles colorless', async () => {
    const result = names(await queryRunner.search("c=c"))
    const result2 = names(await queryRunner.search("c:c"))

    expect(result).toEqual([thoughtKnotSeer.name])
    expect(result).toEqual(result2)
  })

  it('handles color count filters', async function () {
    const result = names(await queryRunner.search("c=2"))

    expect(result).toEqual([aetherbladeAgent.name, kroxaTitanOfDeathsHunger.name])
  })
})