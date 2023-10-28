import { arrogantBloodlord } from './testData/arrogantBloodlord'
import { aetherbladeAgent } from './testData/aetherbladeAgent'
import { davrielsWithering } from './testData/davrielsWithering'
import { crystallineGiant } from './testData/crystallineGiant'
import { necroimpotence } from './testData/necroimpotence'
import { lich } from './testData/lich'
import { QueryRunner } from '../mql'
import { defaultOptions, names } from './testData/_utils'

describe('devotion filter', function() {
  const corpus = [arrogantBloodlord, aetherbladeAgent, davrielsWithering, crystallineGiant, necroimpotence, lich]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })

  it('ignores non-permanent cards', () => {
    const result = names(queryRunner.search("devotion<=b"))

    expect(result).toEqual([aetherbladeAgent.name, crystallineGiant.name])
  })

  it('handles =', function() {
    const result = names(queryRunner.search("devotion=bb"))

    expect(result).toEqual([arrogantBloodlord.name])
  })

  it('handles >=', function() {
    const result = names(queryRunner.search("devotion>=bb"))

    expect(result).toEqual([arrogantBloodlord.name, lich.name, necroimpotence.name])
  })

  it('handles <=', function() {
    const result = names(queryRunner.search("devotion<=bb"))

    expect(result).toEqual([aetherbladeAgent.name, arrogantBloodlord.name, crystallineGiant.name])
  })

  it('handles >', function() {
    const result = names(queryRunner.search("devotion>bb"))

    expect(result).toEqual([lich.name, necroimpotence.name])
  })

  it('handles <', function() {
    const result = names(queryRunner.search("devotion<bb"))

    expect(result).toEqual([aetherbladeAgent.name, crystallineGiant.name])
  })
})