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
  const queryRunner = new QueryRunner({ corpus: [
    spinerockKnoll,
    ancientStirrings,
    preordain,
    concordantCrossroads,
    emberethShieldbreaker,
    elvishPromenade,
    ramunapRuins,
    seasideHaven,
    asymmetrySage,
  ], defaultOptions })
  describe('name filter', function() {
    it("should do a name search when no keyword is present", () => {
      const result = queryRunner.search("orda")._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([concordantCrossroads.name, preordain.name])
    })
    it("should do a name search for a keywordless string", () => {
      const result = queryRunner.search(`"spinerock"`)._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([spinerockKnoll.name])
    })
  })
  describe('exact name filter', function() {
    it("should do a name search when no keyword is present", () => {
      const result = queryRunner.search("!preordain")._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([preordain.name])
    })
    it("should do a name search for a keywordless string", () => {
      const result = queryRunner.search(`!"spinerock knoll"`)._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([spinerockKnoll.name])
    })
  })
  describe('name regex filter', function() {
    it('handles name regex matches', () => {
      const result = queryRunner.search('name=/^A-/')._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([asymmetrySage.name])
    })
  })
  describe('type text filter', function() {
    it('handles multi-face type matches', () => {
      const result = queryRunner.search("t:adventure")._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([emberethShieldbreaker.name])
    })
  })
  describe('type regex filter', function() {
    it('handles type line regex matches', () => {
      const result = queryRunner.search("t=/tribal .* elf/")._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([elvishPromenade.name])
    })
  })
  describe('oracle text filter', function() {
    it ('handles unquoted strings', () => {
      const result = queryRunner.search("o:draw")._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([preordain.name, seasideHaven.name])
    })

    it('excludes reminder text', () => {
      const result = queryRunner.search(`o:"put the rest on the bottom"`)._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([ancientStirrings.name])
    })

    it("substitutes ~ for the card's name", () => {
      const result = queryRunner.search('o:"~ deals 2"')._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([ramunapRuins.name])
    })
  })
  describe('oracle text regex', function() {
    it("filters using regex", () => {
      const result = queryRunner.search("o:/sacrifice a.*:/")._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([ramunapRuins.name, seasideHaven.name])
    })
  })
  describe('full oracle text filter', function() {
    it('includes reminder text', () => {
      const result = queryRunner.search(`fo:"put the rest on the bottom"`)._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([ancientStirrings.name, spinerockKnoll.name])
    })
  })
  describe('full oracle text regex', function() {
    it('includes reminder text', () => {
      const result = queryRunner.search(`fo:/put .* on the bottom/`)._unsafeUnwrap().map(it => it.name)

      expect(result).toEqual([ancientStirrings.name, preordain.name, spinerockKnoll.name])
    })
  })
})