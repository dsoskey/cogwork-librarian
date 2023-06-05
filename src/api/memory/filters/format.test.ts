import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'
import { preordain } from './testData/preordain'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { emberethShieldbreaker } from './testData/emberethShieldbreaker'

describe('format filters', function() {
  const corpus = [preordain, delverOfSecrets, emberethShieldbreaker]
  const queryRunner = new QueryRunner(corpus, defaultOptions);
  it("handles banned cards", function() {
    const result = queryRunner.search("banned:modern")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(preordain.id)
  })
  it("handles restricted cards", function() {
    const result = queryRunner.search("restricted:paupercommander")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(emberethShieldbreaker.id)
  })
})