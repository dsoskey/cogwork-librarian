import { bloodCrypt } from './testData/bloodCrypt'
import { tarmogoyf } from './testData/tarmogoyf'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { asymmetrySage } from './testData/asymmetrySage'

describe('price filter', function() {
  const corpus = [asymmetrySage, bloodCrypt, tarmogoyf];
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })
  describe('usd', function() {
    it(`< should work`, async function() {
      const result = names(await queryRunner.search("usd<15"))

      expect(result).toEqual([tarmogoyf.name])
    })

    it(`= should work`, async function() {
      const result = names(await queryRunner.search("usd=18.52"))

      expect(result).toEqual([bloodCrypt.name])
    })

    it(`!= should work`, async function() {
      const result = names(await queryRunner.search("usd!=18.52"))

      expect(result).toEqual([tarmogoyf.name])
    })

    it(`<= should work`, async function() {
      const result = names(await queryRunner.search("usd<=18.52"))

      expect(result).toEqual([bloodCrypt.name, tarmogoyf.name])
    })

    it(`> should work`, async function() {
      const result = names(await queryRunner.search("usd>15"))

      expect(result).toEqual([bloodCrypt.name])
    })

    it(`>= should work`, async function() {
      const result = names(await queryRunner.search("usd>=11.79"))

      expect(result).toEqual([bloodCrypt.name, tarmogoyf.name])
    })
  })

  describe('eur', function() {
    it(`< should work`, async function() {
      const result = names(await queryRunner.search("eur<15"))

      expect(result).toEqual([tarmogoyf.name])
    })

    it(`= should work`, async function() {
      const result = names(await queryRunner.search("eur=15.86"))

      expect(result).toEqual([bloodCrypt.name])
    })

    it(`!= should work`, async function() {
      const result = names(await queryRunner.search("eur!=15.86"))

      expect(result).toEqual([tarmogoyf.name])
    })

    it(`<= should work`, async function() {
      const result = names(await queryRunner.search("eur<=15.86"))

      expect(result).toEqual([bloodCrypt.name, tarmogoyf.name])
    })

    it(`> should work`, async function() {
      const result = names(await queryRunner.search("eur>15"))

      expect(result).toEqual([bloodCrypt.name])
    })

    it(`>= should work`, async function() {
      const result = names(await queryRunner.search("eur>=12.12"))

      expect(result).toEqual([bloodCrypt.name, tarmogoyf.name])
    })
  })

  describe('tix', function() {
    it(`< should work`, async function() {
      const result = names(await queryRunner.search("tix<3"))

      expect(result).toEqual([bloodCrypt.name])
    })

    it(`= should work`, async function() {
      const result = names(await queryRunner.search("tix=3.13"))

      expect(result).toEqual([tarmogoyf.name])
    })

    it(`!= should work`, async function() {
      const result = names(await queryRunner.search("tix!=3.13"))

      expect(result).toEqual([bloodCrypt.name])
    })

    it(`<= should work`, async function() {
      const result = names(await queryRunner.search("tix<=3.13"))

      expect(result).toEqual([bloodCrypt.name, tarmogoyf.name])
    })

    it(`> should work`, async function() {
      const result = names(await queryRunner.search("tix>3"))

      expect(result).toEqual([tarmogoyf.name])
    })

    it(`>= should work`, async function() {
      const result = names(await queryRunner.search("tix>=2.22"))

      expect(result).toEqual([bloodCrypt.name, tarmogoyf.name])
    })
  })
})