import { arrogantBloodlord } from './testData/arrogantBloodlord'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { davrielsWithering } from './testData/davrielsWithering'
import { crystallineGiant } from './testData/crystallineGiant'
import { necroimpotence } from './testData/necroimpotence'
import { lich } from './testData/lich'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'

describe('devotion filter', function() {
  const corpus = [arrogantBloodlord, aetherbladeAgent, davrielsWithering, crystallineGiant, necroimpotence, lich]
  const queryRunner = new QueryRunner(corpus, defaultOptions)

  it('ignores non-permanenet cards', () => {
    const result = queryRunner.search("devotion<=b")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, crystallineGiant])
  })

  it('handles =', function() {
    const result = queryRunner.search("devotion=bb")._unsafeUnwrap()

    expect(result).toEqual([arrogantBloodlord])
  })

  it('handles >=', function() {
    const result = queryRunner.search("devotion>=bb")._unsafeUnwrap()

    expect(result).toEqual([arrogantBloodlord, lich, necroimpotence])
  })

  it('handles <=', function() {
    const result = queryRunner.search("devotion<=bb")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, arrogantBloodlord, crystallineGiant])
  })

  it('handles >', function() {
    const result = queryRunner.search("devotion>bb")._unsafeUnwrap()

    expect(result).toEqual([lich, necroimpotence])
  })

  it('handles <', function() {
    const result = queryRunner.search("devotion<bb")._unsafeUnwrap()

    expect(result).toEqual([aetherbladeAgent, crystallineGiant])
  })
})