import { QueryRunner } from '../mql'
import { defaultOptions, names } from './testData/_utils'
import { preordain } from './testData/preordain'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { emberethShieldbreaker } from './testData/emberethShieldbreaker'

describe('format filters', function() {
  const corpus = [preordain, delverOfSecrets, emberethShieldbreaker]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });
  it("handles banned cards", function() {
    const result = names(queryRunner.search("banned:modern"))

    expect(result).toEqual([preordain.name])
  })
  it("handles restricted cards", function() {
    const result = names(queryRunner.search("restricted:paupercommander"))

    expect(result).toEqual([emberethShieldbreaker.name])
  })
})