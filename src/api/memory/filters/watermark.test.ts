import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { animateLand } from './testData/animateLand'
import { bloodCrypt } from './testData/bloodCrypt'

describe('watermark filter', function() {
  const corpus = [bloodCrypt, animateLand]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider });

  ["wm", 'watermark'].forEach(filterKeyword => {
    it(`${filterKeyword} gets parsed properly`, async () => {
      const result = names(await queryRunner.search(`${filterKeyword}:rakdos`))

      expect(result).toEqual([bloodCrypt.name])
    })
  })
})