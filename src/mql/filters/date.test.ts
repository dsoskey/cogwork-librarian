import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { preordain } from './testData/preordain'
import { adantoVanguard } from './testData/adantoVanguard'
import { mirrex } from './testData/mirrex'

describe('date filters', function() {
  const corpus = [preordain, adantoVanguard, mirrex]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })

  it("returns an error when the date doesnt fit yyyy-MM-dd", async () => {
    return expect(queryRunner.search("date<jan1st2021")).rejects.toBeTruthy()
  })

  it('should handle year only queries', async () => {
    const result = names(await queryRunner.search("date=2010"))

    expect(result).toEqual([preordain.name])
  })


  it('= compares input date to a printings release date', async () => {
    const result = names(await queryRunner.search("date=2010-07-16"))

    expect(result).toEqual([preordain.name])
  })

  it('< compares input date to a printings release date', async () => {
    const result = names(await queryRunner.search("date<2020-01-01"))

    expect(result).toEqual([adantoVanguard.name, preordain.name])
  })

  it('> compares input date to a printings release date', async () => {
    const result = names(await queryRunner.search("date>2020-01-01"))

    expect(result).toEqual([mirrex.name])
  })

  it('<= compares input date to a printings release date', async () => {
    const result = names(await queryRunner.search("date<=2019-11-07"))

    expect(result).toEqual([adantoVanguard.name, preordain.name])
  })

  it('>= compares input date to a printings release date', async () => {
    const result = names(await queryRunner.search("date>=2019-11-07"))

    expect(result).toEqual([adantoVanguard.name, mirrex.name])
  })
})