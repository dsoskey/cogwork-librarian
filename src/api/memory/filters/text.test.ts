import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { spinerockKnoll } from './testData/spinerockKnoll'
import { ancientStirrings } from './testData/ancientStirrings'
import { preordain } from './testData/preordain'
import { concordantCrossroads } from './testData/concordantCrossroads'
import { emberethShieldbreaker } from './testData/emberethShieldbreaker'
import { elvishPromenade } from './testData/elvishPromenade'
import { ramunapRuins } from './testData/ramunapRuins'
import { seasideHaven } from './testData/seasideHaven'
import { asymmetrySage } from './testData/asymmetrySage'

describe('text filters', function() {
  const queryRunner = new QueryRunner([
    spinerockKnoll,
    ancientStirrings,
    preordain,
    concordantCrossroads,
    emberethShieldbreaker,
    elvishPromenade,
    ramunapRuins,
    seasideHaven,
    asymmetrySage,
  ], defaultOptions)
  describe('name filter', function() {
    it("should do a name search when no keyword is present", () => {
      const result = queryRunner.search("orda")._unsafeUnwrap()

      expect(result).toEqual([concordantCrossroads, preordain])
    })
    it("should do a name search for a keywordless string", () => {
      const result = queryRunner.search(`"spinerock"`)._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(spinerockKnoll.id)
    })
  })
  describe('exact name filter', function() {
    it("should do a name search when no keyword is present", () => {
      const result = queryRunner.search("!preordain")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(preordain.id)
    })
    it("should do a name search for a keywordless string", () => {
      const result = queryRunner.search(`!"spinerock knoll"`)._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(spinerockKnoll.id)
    })
  })
  describe('name regex filter', function() {
    it('handles name regex matches', () => {
      const result = queryRunner.search('name=/^A-/')._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(asymmetrySage.id)
    })
  })
  describe('type text filter', function() {
    it('handles multi-face type matches', () => {
      const result = queryRunner.search("t:adventure")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(emberethShieldbreaker.id)
    })
  })
  describe('type regex filter', function() {
    it('handles type line regex matches', () => {
      const result = queryRunner.search("t=/tribal .* elf/")._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(elvishPromenade.id)
    })
  })
  describe('oracle text filter', function() {
    it ('handles unquoted strings', () => {
      const result = queryRunner.search("o:draw")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(preordain.id)
      expect(result[1].id).toEqual(seasideHaven.id)
    })

    it('excludes reminder text', () => {
      const result = queryRunner.search(`o:"put the rest on the bottom"`)._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(ancientStirrings.id)
    })

    it("substitutes ~ for the card's name", () => {
      const result = queryRunner.search('o:"~ deals 2"')._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(ramunapRuins.id)
    })
  })
  describe('oracle text regex', function() {
    it("filters using regex", () => {
      const result = queryRunner.search("o:/sacrifice a.*:/")._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(ramunapRuins.id)
      expect(result[1].id).toEqual(seasideHaven.id)
    })
  })
  describe('full oracle text filter', function() {
    it('includes reminder text', () => {
      const result = queryRunner.search(`fo:"put the rest on the bottom"`)._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(ancientStirrings.id)
      expect(result[1].id).toEqual(spinerockKnoll.id)
    })
  })
  describe('full oracle text regex', function() {
    it('includes reminder text', () => {
      const result = queryRunner.search(`fo:/put .* on the bottom/`)._unsafeUnwrap()

      expect(result.length).toEqual(3)
      expect(result[0].id).toEqual(ancientStirrings.id)
      expect(result[1].id).toEqual(preordain.id)
      expect(result[2].id).toEqual(spinerockKnoll.id)
    })
  })
})