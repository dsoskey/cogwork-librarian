import { lagoHirvienteDeDarigaaz } from './testData/lagoHirvienteDeDarigaaz'
import { asymmetrySage } from './testData/asymmetrySage'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'

describe('language filter', function() {
  const corpus = [asymmetrySage, lagoHirvienteDeDarigaaz]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })
  it('should show all cards for language:any', async function() {
    const result = names(await queryRunner.search("language:any"))

    expect(result).toEqual(corpus.map(it => it.name))
  })
  it('should filter by language otherwise', async function() {
    const result = names(await queryRunner.search("language:es"))

    expect(result).toEqual([lagoHirvienteDeDarigaaz.name])
  })
})