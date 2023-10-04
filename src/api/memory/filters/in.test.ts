import { preordain } from './testData/preordain'
import { asymmetrySage } from './testData/asymmetrySage'
import { lagoHirvienteDeDarigaaz } from './testData/lagoHirvienteDeDarigaaz'
import { QueryRunner } from '../queryRunner'
import { defaultOptions, names } from './testData/_utils'
import { ftvDelverOfSecrets } from './testData/delverOfSecrets'
import { darkConfidant } from './testData/darkConfidant'
import { sldBerserk } from './testData/berserk'

describe('in filter', function() {
  const corpus = [preordain, asymmetrySage, lagoHirvienteDeDarigaaz];
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it('should show cards that were printed in a set', function() {
    const result = names(queryRunner.search("in:m11"))

    expect(result).toEqual([preordain.name])
  })
  it('should show cards that were printed in a set_type', function() {
    const result = names(queryRunner.search("in:core"))

    expect(result).toEqual([preordain.name])
  })
  it('should show cards that were printed in a game', function() {
    const result = names(queryRunner.search("in:arena"))

    expect(result).toEqual([asymmetrySage.name])
  })
  it('should show cards that were printed in a language', function() {
    const result = names(queryRunner.search("in:es"))

    expect(result).toEqual([lagoHirvienteDeDarigaaz.name])
  })
  it('should ignore cards that were printed at a rarity in a cursed set or set type', () => {
    const runner = new QueryRunner({ corpus: [darkConfidant, ftvDelverOfSecrets, sldBerserk] })
    const result = names(runner.search("in:mythic"));

    expect(result).toEqual([darkConfidant.name]);
  })
})