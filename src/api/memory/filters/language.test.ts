import { lagoHirvienteDeDarigaaz } from './testData/lagoHirvienteDeDarigaaz'
import { asymmetrySage } from './testData/asymmetrySage'
import { QueryRunner } from '../mql'
import { defaultOptions, names } from './testData/_utils'

describe('language filter', function() {
  const corpus = [asymmetrySage, lagoHirvienteDeDarigaaz]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it('should show all cards for language:any', function() {
    const result = names(queryRunner.search("language:any"))

    expect(result).toEqual(corpus.map(it => it.name))
  })
  it('should filter by language otherwise', function() {
    const result = names(queryRunner.search("language:es"))

    expect(result).toEqual([lagoHirvienteDeDarigaaz.name])
  })
})