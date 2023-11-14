import { gorillaTitan } from './testData/gorillaTitan'
import { birdsOfParadise } from './testData/birdsOfParadise'
import { emberethShieldbreaker } from './testData/emberethShieldbreaker'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { QueryRunner } from '../queryRunner'

describe("flavor filters", () => {
  const corpus = [gorillaTitan, birdsOfParadise, emberethShieldbreaker]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })

  it('should handle string searches', async function() {
    const result = names(await queryRunner.search("flavor:banana"))

    expect(result).toEqual([gorillaTitan.name])
  })

  it('should handle regex searches', async function() {
    const result = names(await queryRunner.search('flavor:/".+"/'))

    expect(result).toEqual([emberethShieldbreaker.name, gorillaTitan.name])
  })
})