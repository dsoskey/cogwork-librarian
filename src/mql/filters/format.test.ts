import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { preordain } from './testData/preordain'
import { delverOfSecrets } from './testData/delverOfSecrets'
import { emberethShieldbreaker } from './testData/emberethShieldbreaker'

describe('format filters', function() {
  const corpus = [preordain, delverOfSecrets, emberethShieldbreaker]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider });
  it("handles banned cards", async function() {
    const result = names(await queryRunner.search("banned:modern"))

    expect(result).toEqual([preordain.name])
  })
  it("handles restricted cards", async function() {
    const result = names(await queryRunner.search("restricted:paupercommander"))

    expect(result).toEqual([emberethShieldbreaker.name])
  })
})