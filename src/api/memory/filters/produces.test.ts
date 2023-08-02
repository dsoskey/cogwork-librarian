import { QueryRunner } from '../queryRunner'
import { bloodCrypt } from './testData/bloodCrypt'
import { birdsOfParadise } from './testData/birdsOfParadise'
import { ramunapRuins } from './testData/ramunapRuins'
import { concordantCrossroads } from './testData/concordantCrossroads'
import { bojukaBog } from './testData/bojukaBog'
import { defaultOptions } from './testData/_options'

const corpus = [bojukaBog, bloodCrypt, birdsOfParadise, ramunapRuins, concordantCrossroads]
const queryRunner = new QueryRunner({ corpus, defaultOptions })
describe('produces filter', function() {
  describe('mana', function() {
    it("handles >= and :", () => {
      const result = queryRunner.search("produces:r")._unsafeUnwrap()
      const result2 = queryRunner.search("produces>=r")._unsafeUnwrap()

      expect(result).toEqual(result2)
      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual(birdsOfParadise.id)
      expect(result[1].id).toEqual(bloodCrypt.id)
      expect(result[2].id).toEqual(ramunapRuins.id)
    })

    it("handles =", () => {
      const result = queryRunner.search("produces=rc")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(ramunapRuins.id)
    })

    it("handles !=", () => {
      const result = queryRunner.search("produces!=u")._unsafeUnwrap()

      expect(result.length).toEqual(4) // This fails
      expect(result[0].id).toEqual(birdsOfParadise.id)
      expect(result[1].id).toEqual(bloodCrypt.id)
      expect(result[2].id).toEqual(bojukaBog.id)
      expect(result[3].id).toEqual(ramunapRuins.id)
    })

    it("handles <", () => {
      const result = queryRunner.search("produces<jund")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(bojukaBog.id)
    })

    it("handles <=", () => {
      const result = queryRunner.search("produces<=rakdos")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(bojukaBog.id)
    })

    it("handles >", () => {
      const result = queryRunner.search("produces>b")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(birdsOfParadise.id)
      expect(result[1].id).toEqual(bloodCrypt.id)

    })
  })
  describe('count', function() {
    it('handles counting the number of colors cards produce', () => {
      const result = queryRunner.search("produces=2")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(ramunapRuins.id)
    })

    it('handles > comparisons for the number of colors cards produce', () => {
      const result = queryRunner.search("produces>1")._unsafeUnwrap()

      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual(birdsOfParadise.id)
      expect(result[1].id).toEqual(bloodCrypt.id)
      expect(result[2].id).toEqual(ramunapRuins.id)
    })
  })
})