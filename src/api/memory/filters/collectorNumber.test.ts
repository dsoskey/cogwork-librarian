import { phantomBeast } from './testData/phantomBeast'
import { preordain } from './testData/preordain'
import { negate } from './testData/negate'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'


describe('collectorNumber filter', function() {
  const corpus = [negate, phantomBeast, preordain]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider });

  ['cn', 'number'].forEach(filterKeyword => {
    it(`${filterKeyword} parses <= properly`, async () => {
      const result = names(await queryRunner.search(`${filterKeyword}<=69`))

      expect(result).toEqual([negate.name, phantomBeast.name])
    })
  })

  it("parses < properly", async () => {
    const result = names(await queryRunner.search('cn<69'))

    expect(result).toEqual([negate.name])
  })
  it("parses >= properly", async () => {
    const result = names(await queryRunner.search('cn>=69'))

    expect(result).toEqual([phantomBeast.name, preordain.name])
  })
  it("parses > properly", async () => {
    const result = names(await queryRunner.search('cn>69'))

    expect(result).toEqual([preordain.name])
  })
  it("parses = properly", async () => {
    const result = names(await queryRunner.search('cn=69'))

    expect(result).toEqual([phantomBeast.name])
  })
  it("parses != properly", async () => {
    const result = names(await queryRunner.search('cn!=69'))

    expect(result).toEqual([negate.name, preordain.name])
  })
})