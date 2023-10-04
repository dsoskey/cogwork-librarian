import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_utils'
import { animateLand } from './testData/animateLand'
import { bloodCrypt } from './testData/bloodCrypt'

describe('watermark filter', function() {
  const corpus = [bloodCrypt, animateLand]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });

  ["wm", 'watermark'].forEach(filterKeyword => {
    it(`${filterKeyword} gets parsed properly`, () => {
      const result = queryRunner.search(`${filterKeyword}:rakdos`)._unsafeUnwrap()

      expect(result[0].id).toEqual(bloodCrypt.id)
    })
  })
})