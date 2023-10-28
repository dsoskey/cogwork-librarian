import { QueryRunner } from '../mql'
import { narcomoeba } from './testData/narcomoeba'
import { crystallineGiant } from './testData/crystallineGiant'
import { defaultOptions } from './testData/_utils'

describe('frame filter', function() {
  const corpus = [narcomoeba, crystallineGiant]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it("matches the card's frame exactly", () => {
    const result = queryRunner.search("frame:future")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(narcomoeba.id)
  })
})