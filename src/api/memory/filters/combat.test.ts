import { QueryRunner } from '../queryRunner'
import { phantomBeast } from './testData/phantomBeast'
import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { defaultOptions } from './testData/_options'
import { norinTheWary } from './testData/norinTheWary'
import { tarmogoyf } from './testData/tarmogoyf'
import { preordain } from './testData/preordain'

describe('combat filters', function() {
  const corpus = [
    phantomBeast,
    kroxaTitanOfDeathsHunger,
    norinTheWary,
    preordain,
  ]
  const queryRunner = new QueryRunner(corpus, defaultOptions)

  const dfcCorpus = [
    delverOfSecrets,
  ]
  const dfcQueryRunner = new QueryRunner(dfcCorpus, defaultOptions)
  describe('combatToCombatNode', function() {
    it('should handle pow number comparisons and dfcs', () => {
      const result = dfcQueryRunner.search("pow>2")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(delverOfSecrets.id)
    })

    it('should handle tou number comparisons and dfcs', () => {
      const result = dfcQueryRunner.search("tou<2")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(delverOfSecrets.id)
    })

    it('should handle pow>tou', function() {
      const result = queryRunner.search("pow>tou")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(norinTheWary.id)
    })
    it('should handle pow=tou', function() {
      const result = queryRunner.search("pow=tou")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
    })
    it('should handle pow<tou', function() {
      const result = queryRunner.search("pow<tou")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(phantomBeast.id)
    })
    it('should handle pow>=tou', function() {
      const result = queryRunner.search("pow>=tou")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
      expect(result[1].id).toEqual(norinTheWary.id)
    })
    it('should handle pow<=tou', function() {
      const result = queryRunner.search("pow<=tou")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
      expect(result[1].id).toEqual(phantomBeast.id)
    })
    it('should handle pow!=tou', function() {
      const result = queryRunner.search("pow!=tou")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(norinTheWary.id)
      expect(result[1].id).toEqual(phantomBeast.id)
    })

    it('should handle tou>pow', function() {
      const result = queryRunner.search("tou>pow")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(phantomBeast.id)
    })
    it('should handle tou=pow', function() {
      const result = queryRunner.search("tou=pow")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
    })
    it('should handle tou<pow', function() {
      const result = queryRunner.search("tou<pow")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(norinTheWary.id)
    })
    it('should handle tou>=pow', function() {
      const result = queryRunner.search("tou>=pow")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[1].id).toEqual(phantomBeast.id)
      expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
    })
    it('should handle tou<=pow', function() {
      const result = queryRunner.search("tou<=pow")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
      expect(result[1].id).toEqual(norinTheWary.id)
    })

    it("should handle stars", () => {
      const goyfQueryRunner = new QueryRunner([tarmogoyf], defaultOptions)
      const result = goyfQueryRunner.search('pow=0 name:tarmogoyf')._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })
  })

  describe('powTouTotalOperation', function() {
    ["pt", "powtou"].forEach(filterKeyword => {
      it(`should handle ${filterKeyword}`, () => {
        const result = queryRunner.search(`${filterKeyword}>11`)._unsafeUnwrap()

        expect(result.length).toEqual(1)
        expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
      })
    })
  })
})