import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_utils'
import { preordain } from './testData/preordain'
import { adantoVanguard } from './testData/adantoVanguard'
import { mirrex } from './testData/mirrex'

describe('date filters', function() {
  const corpus = [preordain, adantoVanguard, mirrex]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })

  it("returns an error when the date doesnt fit yyyy-MM-dd", () => {
    const result = queryRunner.search("date<jan1st2021")

    expect(result.isErr()).toEqual(true)
  })

  it('should handle year only queries', () => {
    const result = queryRunner.search("date=2010")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(preordain.id)
  })


  it('= compares input date to a printings release date', () => {
    const result = queryRunner.search("date=2010-07-16")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(preordain.id)
  })

  it('< compares input date to a printings release date', () => {
    const result = queryRunner.search("date<2020-01-01")._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(adantoVanguard.id)
    expect(result[1].id).toEqual(preordain.id)
  })

  it('> compares input date to a printings release date', () => {
    const result = queryRunner.search("date>2020-01-01")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(mirrex.id)
  })

  it('<= compares input date to a printings release date', () => {
    const result = queryRunner.search("date<=2019-11-07")._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(adantoVanguard.id)
    expect(result[1].id).toEqual(preordain.id)
  })

  it('>= compares input date to a printings release date', () => {
    const result = queryRunner.search("date>=2019-11-07")._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(adantoVanguard.id)
    expect(result[1].id).toEqual(mirrex.id)
  })
})