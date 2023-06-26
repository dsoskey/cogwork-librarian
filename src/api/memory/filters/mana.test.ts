import { davrielsWithering } from './testData/davrielsWithering'
import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { preordain } from './testData/preordain'
import { darkConfidant } from './testData/darkConfidant'

describe('mana filter', function() {
  const corpus = [preordain, davrielsWithering, darkConfidant, kroxaTitanOfDeathsHunger]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it('should handle exact match', function() {
    const result = queryRunner.search("mana=rb")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([kroxaTitanOfDeathsHunger.name])
  })

  it('should handle != filter', function() {
    const result = queryRunner.search("m!=b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([darkConfidant.name, kroxaTitanOfDeathsHunger.name, preordain.name])
  })

  it('should handle > filter', function() {
    const result = queryRunner.search("mana>b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([darkConfidant.name, kroxaTitanOfDeathsHunger.name])
  })

  it('should handle < filter', function() {
    const result = queryRunner.search("mana<rb")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([davrielsWithering.name])
  })

  it('should handle <= filter', function() {
    const result = queryRunner.search("mana<=rb")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
  })

  it('should handle >= filter, which is the default', function() {
    const result = queryRunner.search("mana>=b")._unsafeUnwrap().map(it => it.name)
    const defaultResult = queryRunner.search("mana:b")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([darkConfidant.name, davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
    expect(result).toEqual(defaultResult)
  })
})