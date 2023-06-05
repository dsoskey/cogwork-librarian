import { bloodCrypt } from './testData/bloodCrypt'
import { tarmogoyf } from './testData/tarmogoyf'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { asymmetrySage } from './testData/asymmetrySage'

describe('price filter', function() {
  const corpus = [asymmetrySage, bloodCrypt, tarmogoyf];
  const queryRunner = new QueryRunner(corpus, defaultOptions)
  describe('usd', function() {
    it(`< should work`, function() {
      const result = queryRunner.search("usd<15")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })

    it(`= should work`, function() {
      const result = queryRunner.search("usd=18.52")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(bloodCrypt.id)
    })

    it(`!= should work`, function() {
      const result = queryRunner.search("usd!=18.52")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })

    it(`<= should work`, function() {
      const result = queryRunner.search("usd<=18.52")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(tarmogoyf.id)
    })

    it(`> should work`, function() {
      const result = queryRunner.search("usd>15")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(bloodCrypt.id)
    })

    it(`>= should work`, function() {
      const result = queryRunner.search("usd>=11.79")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(tarmogoyf.id)
    })
  })

  describe('eur', function() {
    it(`< should work`, function() {
      const result = queryRunner.search("eur<15")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })

    it(`= should work`, function() {
      const result = queryRunner.search("eur=15.86")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(bloodCrypt.id)
    })

    it(`!= should work`, function() {
      const result = queryRunner.search("eur!=15.86")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })

    it(`<= should work`, function() {
      const result = queryRunner.search("eur<=15.86")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(tarmogoyf.id)
    })

    it(`> should work`, function() {
      const result = queryRunner.search("eur>15")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(bloodCrypt.id)
    })

    it(`>= should work`, function() {
      const result = queryRunner.search("eur>=12.12")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(tarmogoyf.id)
    })
  })

  describe('tix', function() {
    it(`< should work`, function() {
      const result = queryRunner.search("tix<3")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(bloodCrypt.id)
    })

    it(`= should work`, function() {
      const result = queryRunner.search("tix=3.13")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })

    it(`!= should work`, function() {
      const result = queryRunner.search("tix!=3.13")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(bloodCrypt.id)
    })

    it(`<= should work`, function() {
      const result = queryRunner.search("tix<=3.13")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(tarmogoyf.id)
    })

    it(`> should work`, function() {
      const result = queryRunner.search("tix>3")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(tarmogoyf.id)
    })

    it(`>= should work`, function() {
      const result = queryRunner.search("tix>=2.22")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(bloodCrypt.id)
      expect(result[1].id).toEqual(tarmogoyf.id)
    })
  })
})