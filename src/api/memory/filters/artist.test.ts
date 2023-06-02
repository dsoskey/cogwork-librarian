import { mirrex } from './testData/mirrex'
import { animateLand } from './testData/animateLand'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'

describe('artist filter', function() {
  const corpus = [mirrex, animateLand]
  const queryRunner = new QueryRunner(corpus, defaultOptions);

  ["a", 'artist'].forEach(filterKeyword => {
    it(`${filterKeyword} gets parsed properly`, () => {
      const result = queryRunner.search(`${filterKeyword}:"Rebecca Guay"`)
      console.log(result)

      expect(result._unsafeUnwrap()[0].id).toEqual(animateLand.id)
    })

  })
})