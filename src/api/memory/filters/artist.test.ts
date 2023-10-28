import { mirrex } from './testData/mirrex'
import { animateLand } from './testData/animateLand'
import { QueryRunner } from '../mql'
import { defaultOptions } from './testData/_utils'

describe('artist filter', function() {
  const corpus = [mirrex, animateLand]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });

  ["a", 'artist'].forEach(filterKeyword => {
    it(`${filterKeyword} gets parsed properly`, () => {
      const result = queryRunner.search(`${filterKeyword}:"Rebecca Guay"`)._unsafeUnwrap()

      expect(result[0].id).toEqual(animateLand.id)
    })

  })
})