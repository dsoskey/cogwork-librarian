import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { asymmetrySage } from './testData/asymmetrySage'
import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'

describe('keyword filters', function() {
  const corpus = [kroxaTitanOfDeathsHunger, asymmetrySage]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })
  it("should match to any card with the keyword", async function() {
    const result = names(await queryRunner.search("keyword:escape"))

    expect(result).toEqual([kroxaTitanOfDeathsHunger.name])
  })
})