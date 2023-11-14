import { davrielsWithering } from './testData/davrielsWithering'
import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { preordain } from './testData/preordain'
import { darkConfidant } from './testData/darkConfidant'

describe('mana filter', function() {
  const corpus = [preordain, davrielsWithering, darkConfidant, kroxaTitanOfDeathsHunger]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })
  it('should handle exact match', async function() {
    const result = names(await queryRunner.search("mana=rb"))

    expect(result).toEqual([kroxaTitanOfDeathsHunger.name])
  })

  it('should handle != filter', async function() {
    const result = names(await queryRunner.search("m!=b"))

    expect(result).toEqual([darkConfidant.name, kroxaTitanOfDeathsHunger.name, preordain.name])
  })

  it('should handle > filter', async function() {
    const result = names(await queryRunner.search("mana>b"))

    expect(result).toEqual([darkConfidant.name, kroxaTitanOfDeathsHunger.name])
  })

  it('should handle < filter', async function() {
    const result = names(await queryRunner.search("mana<rb"))

    expect(result).toEqual([davrielsWithering.name])
  })

  it('should handle <= filter', async function() {
    const result = names(await queryRunner.search("mana<=rb"))

    expect(result).toEqual([davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
  })

  it('should handle >= filter, which is the default', async function() {
    const result = names(await queryRunner.search("mana>=b"))
    const defaultResult = names(await queryRunner.search("mana:b"))

    expect(result).toEqual([darkConfidant.name, davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
    expect(result).toEqual(defaultResult)
  })
})