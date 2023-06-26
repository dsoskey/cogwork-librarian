import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { animateLand } from './testData/animateLand'
import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'

describe('stamp filter', function() {
  const corpus = [kroxaTitanOfDeathsHunger, animateLand]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });

  it("gets parsed properly", () => {
    const result = queryRunner.search('stamp:oval')._unsafeUnwrap()

    expect(result[0].id).toEqual(kroxaTitanOfDeathsHunger.id)
  })
})