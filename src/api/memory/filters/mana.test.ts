import { davrielsWithering } from './testData/davrielsWithering'
import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { preordain } from './testData/preordain'
import { darkConfidant } from './testData/darkConfidant'

describe('mana filter', function() {
  const corpus = [preordain, davrielsWithering, darkConfidant, kroxaTitanOfDeathsHunger]
  const queryRunner = new QueryRunner(corpus, defaultOptions)
  it('should handle exact match', function() {
    const result = queryRunner.search("mana=rb")._unsafeUnwrap()

    expect(result).toEqual([kroxaTitanOfDeathsHunger])
  })

  it('should handle != filter', function() {
    const result = queryRunner.search("m!=b")._unsafeUnwrap()

    expect(result).toEqual([darkConfidant, kroxaTitanOfDeathsHunger, preordain])
  })

  it('should handle > filter', function() {
    const result = queryRunner.search("mana>b")._unsafeUnwrap()

    expect(result).toEqual([darkConfidant, kroxaTitanOfDeathsHunger])
  })

  it('should handle < filter', function() {
    const result = queryRunner.search("mana<rb")._unsafeUnwrap()

    expect(result).toEqual([davrielsWithering])
  })

  it('should handle <= filter', function() {
    const result = queryRunner.search("mana<=rb")._unsafeUnwrap()

    expect(result).toEqual([davrielsWithering, kroxaTitanOfDeathsHunger])
  })

  it('should handle >= filter, which is the default', function() {
    const result = queryRunner.search("mana>=b")._unsafeUnwrap()
    const defaultResult = queryRunner.search("mana:b")._unsafeUnwrap()

    expect(result).toEqual([darkConfidant, davrielsWithering, kroxaTitanOfDeathsHunger])
    expect(result).toEqual(defaultResult)
  })
})