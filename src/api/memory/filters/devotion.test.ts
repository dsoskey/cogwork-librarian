import { arrogantBloodlord } from './testData/arrogantBloodlord'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { davrielsWithering } from './testData/davrielsWithering'
import { crystallineGiant } from './testData/crystallineGiant'
import { necroimpotence } from './testData/necroimpotence'
import { lich } from './testData/lich'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_utils'

describe('devotion filter', function() {
  const corpus = [arrogantBloodlord, aetherbladeAgent, davrielsWithering, crystallineGiant, necroimpotence, lich]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })

  it('ignores non-permanenet cards', () => {
    const result = queryRunner.search("devotion<=b")._unsafeUnwrap().map(it => it.id)

    expect(result).toEqual([aetherbladeAgent.id, crystallineGiant.id])
  })

  it('handles =', function() {
    const result = queryRunner.search("devotion=bb")._unsafeUnwrap().map(it => it.id)

    expect(result).toEqual([arrogantBloodlord.id])
  })

  it('handles >=', function() {
    const result = queryRunner.search("devotion>=bb")._unsafeUnwrap().map(it => it.id)

    expect(result).toEqual([arrogantBloodlord.id, lich.id, necroimpotence.id])
  })

  it('handles <=', function() {
    const result = queryRunner.search("devotion<=bb")._unsafeUnwrap().map(it => it.id)

    expect(result).toEqual([aetherbladeAgent.id, arrogantBloodlord.id, crystallineGiant.id])
  })

  it('handles >', function() {
    const result = queryRunner.search("devotion>bb")._unsafeUnwrap().map(it => it.id)

    expect(result).toEqual([lich.id, necroimpotence.id])
  })

  it('handles <', function() {
    const result = queryRunner.search("devotion<bb")._unsafeUnwrap().map(it => it.id)

    expect(result).toEqual([aetherbladeAgent.id, crystallineGiant.id])
  })
})