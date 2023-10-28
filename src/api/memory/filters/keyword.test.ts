import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { asymmetrySage } from './testData/asymmetrySage'
import { QueryRunner } from '../mql'
import { defaultOptions } from './testData/_utils'

describe('keyword filters', function() {
  const corpus = [kroxaTitanOfDeathsHunger, asymmetrySage]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it("should match to any card with the keyword", function() {
    const result = queryRunner.search("keyword:escape")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
  })
})