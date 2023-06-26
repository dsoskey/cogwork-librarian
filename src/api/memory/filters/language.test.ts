import { lagoHirvienteDeDarigaaz } from './testData/lagoHirvienteDeDarigaaz'
import { asymmetrySage } from './testData/asymmetrySage'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'

describe('language filter', function() {
  const corpus = [asymmetrySage, lagoHirvienteDeDarigaaz]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it('should show all cards for language:any', function() {
    const result = queryRunner.search("language:any")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual(corpus.map(it => it.name))
  })
  it('should filter by language otherwise', function() {
    const result = queryRunner.search("language:es")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([lagoHirvienteDeDarigaaz.name])
  })
})