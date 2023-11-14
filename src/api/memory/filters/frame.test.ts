import { QueryRunner } from '../queryRunner'
import { narcomoeba } from './testData/narcomoeba'
import { crystallineGiant } from './testData/crystallineGiant'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'

describe('frame filter', function() {
  const corpus = [narcomoeba, crystallineGiant]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })
  it("matches the card's frame exactly", async () => {
    const result = names(await queryRunner.search("frame:future"))

    expect(result).toEqual([narcomoeba.name])
  })
})