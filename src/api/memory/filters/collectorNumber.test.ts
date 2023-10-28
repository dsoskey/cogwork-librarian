import { phantomBeast } from './testData/phantomBeast'
import { preordain } from './testData/preordain'
import { negate } from './testData/negate'
import { QueryRunner } from '../mql'
import { defaultOptions } from './testData/_utils'


describe('collectorNumber filter', function() {
  const corpus = [negate, phantomBeast, preordain]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });

  ['cn', 'number'].forEach(filterKeyword => {
    it(`${filterKeyword} parses <= properly`, () => {
      const result = queryRunner.search(`${filterKeyword}<=69`)._unsafeUnwrap()

      expect(result.length).toEqual(2)
      expect(result[0].id).toEqual(negate.id)
      expect(result[1].id).toEqual(phantomBeast.id)
    })
  })

  it("parses < properly", () => {
    const result = queryRunner.search('cn<69')._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(negate.id)
  })
  it("parses >= properly", () => {
    const result = queryRunner.search('cn>=69')._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(phantomBeast.id)
    expect(result[1].id).toEqual(preordain.id)
  })
  it("parses > properly", () => {
    const result = queryRunner.search('cn>69')._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(preordain.id)
  })
  it("parses = properly", () => {
    const result = queryRunner.search('cn=69')._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(phantomBeast.id)
  })
  it("parses != properly", () => {
    const result = queryRunner.search('cn!=69')._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(negate.id)
    expect(result[1].id).toEqual(preordain.id)
  })
})